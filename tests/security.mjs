import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
const origin = 'http://127.0.0.1:4188';
const env = {...process.env, WHATSAPP_APP_SECRET:'test-only-webhook-key', OPS_PASSWORD:'', DATABASE_URL:'file:./test-not-created.db'};
for (const key of Object.keys(env)) if (/POSTGRES|NEON|AI_API_KEY|WHATSAPP_ACCESS_TOKEN|RESEND_API_KEY/.test(key)) delete env[key];
const app = spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','4188'],{env,stdio:['ignore','pipe','pipe']});
let logs='';app.stdout.on('data',v=>logs+=v);app.stderr.on('data',v=>logs+=v);
const get = (path,init={})=>fetch(origin+path,{redirect:'manual',...init});
try {
 let ready=false;
 for(let i=0;i<100;i++){try{if((await get('/')).ok){ready=true;break;}}catch{} await new Promise(r=>setTimeout(r,100));}
 assert(ready,'Server did not start');
 const home=await get('/');const html=await home.text();
 assert.equal(home.headers.get('x-frame-options'),'DENY');
 assert.equal(home.headers.get('x-content-type-options'),'nosniff');
 assert.match(home.headers.get('content-security-policy'),/object-src 'none'/);
 assert(!home.headers.get('content-security-policy').includes('unsafe-eval'));
 assert.match(html,/rel="canonical" href="https:\/\/www.zentratechagency.com\/?"/);
 assert.match(html,/application\/ld\+json/);assert.match(html,/google-site-verification/);
 const siteMap=await (await get('/sitemap.xml')).text();assert(!siteMap.includes('/privacy'));assert(!siteMap.includes('/ops'));assert(siteMap.includes('https://www.zentratechagency.com/'));
 for(const path of ['/ops','/ops/enquiries','/ops/analytics','/ops/leads','/ops/knowledge','/ops/chats/fake','/ops/enquiries/fake','/ops/leads/fake']){
  const r=await get(path,{headers:{cookie:'zentra_ops=forged-cookie'}});
  assert.equal(r.status,307,path);assert.match(r.headers.get('location'),/\/ops\/login/);
 }
 const login=await get('/ops/login',{headers:{cookie:'zentra_ops=expired-cookie'}});
 assert.equal(login.status,200);assert(!(await login.text()).includes('googletagmanager.com/gtag'));
 assert.equal((await get('/api/ops/login')).status,405);
 assert.equal((await get('/api/ops/login',{method:'POST',headers:{origin:'https://attacker.invalid'}})).status,403);
 assert.equal((await get('/api/enquiry',{method:'POST',headers:{origin:'https://attacker.invalid'},body:'{}'})).status,403);
 assert.equal((await get('/api/enquiry',{method:'POST',headers:{origin,'content-type':'application/json'},body:'x'.repeat(17000)})).status,400);
 assert.equal((await get('/api/whatsapp/webhook',{method:'POST',body:'{}'})).status,401);
 assert.equal((await get('/api/whatsapp/webhook',{method:'POST',headers:{'x-hub-signature-256':'sha256=forged'},body:'{}'})).status,401);
 assert.equal((await get('/api/whatsapp/webhook',{method:'POST',body:'x'.repeat(200001)})).status,413);
 assert.equal((await get('/api/ops/followups/run',{method:'POST'})).status,401);
 console.log('PASS: headers, canonical, schema, sitemap, verification tag, private-page auth, stale-cookie login, diagnostic closure, cross-site POSTs, webhook signatures/body limits, cron authentication. No external messages sent.');
} catch(e){console.error(logs.slice(-2500));throw e;} finally{app.kill('SIGTERM');}
