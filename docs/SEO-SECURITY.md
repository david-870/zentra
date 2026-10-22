# Zentra SEO and security

## Changes
- Public homepage uses a descriptive search title, canonical URL and Organization JSON-LD. No invented reviews, office address or social profiles.
- Sitemap includes the indexable homepage only. Legal pages remain noindex. Existing Google verification token is preserved.
- Security headers restrict frames, plugins, form destinations and content sources. CSP permits inline scripts for static Next.js hydration; it is a baseline policy, not strict nonce-based XSS protection.
- Admin data pages check authentication before queries. Sessions now require database-backed, expiring, revocable IDs; legacy signed-cookie sessions are rejected. Previously signed-in users may need to sign in again.
- Login no longer exposes diagnostics or permits a default password. OPS_PASSWORD must be at least 12 characters and not the previous example value. Set a long unique password in Vercel, not in GitHub.
- Login attempts are counted atomically in Postgres across instances (12 per IP per 10 minutes); storage failure blocks login. The new ops_login_limits table is created additively, and old counters are cleaned up.
- Login and enquiry POSTs require same-origin browser requests. Enquiry/webhook bodies have streaming size limits. Admin authentication remains mandatory; robots.txt is not access control.
- WhatsApp POST requires WHATSAPP_APP_SECRET and a valid signature. Without this setting the route returns 503 instead of processing unsigned traffic. Set the correct existing Meta app secret through the hosting dashboard before relying on the assistant.
- Analytics scripts load only on public marketing pages, not admin pages. Public endpoint rate limits remain per-instance; use a hosting-level firewall/rate-limit rule for distributed abuse protection.
- Updated Next.js/React/image-processing dependencies. Prisma 6 stays in place to avoid a database migration; patched deepmerge-ts 8 and Effect 3 are scoped overrides for its config package. Retest Prisma tooling when changing these overrides.
- Dependabot checks npm dependencies weekly. It opens reviewable PRs, not automatic production upgrades.

## Google Search Console (owner account required)
1. Open https://search.google.com/search-console and choose the existing property if present.
2. For a URL-prefix property use https://www.zentratechagency.com/ and HTML-tag verification. The deployed site already has an ownership tag; preserve it. If Google gives a different token, set GOOGLE_SITE_VERIFICATION to that token and redeploy. Never paste passwords into chat or GitHub.
3. A Domain property instead requires Google's exact DNS TXT token in the authoritative DNS provider; do not change existing mail/DNS records.
4. Submit https://www.zentratechagency.com/sitemap.xml under Sitemaps, inspect the homepage and request indexing.
5. Review Pages, Core Web Vitals, Security issues and Manual actions. A verification tag alone does not prove verified ownership or indexing, and SEO changes do not guarantee rankings.

## Owner controls still required
Enable two-factor authentication on GitHub, Vercel, Google, domain/DNS and Meta accounts. Review collaborators, use least privilege, and retain tested database backups. Do not enable broad access or paste tokens into source. This code review does not verify account settings, production secrets, backup restoration or a full penetration test.

## Validation
Run npm ci, npm run build, npm run test:security and npm audit. Tests run an isolated local app, check access denial and security/SEO responses, and do not send messages to customers. Valid production login, Meta delivery and Search Console ownership need separately authorized account access.
