import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/brand/Logo";
import { site } from "@/content/site";
import { whatsappHref } from "@/lib/whatsapp";

export function Hero() {
 return <section id="top" className="relative overflow-hidden border-b border-hairline">
  <div aria-hidden="true" className="pointer-events-none absolute -top-20 right-0 h-[38rem] w-[80%] bg-[radial-gradient(ellipse_at_top,rgba(25,85,160,0.2),transparent_65%)]" />
  <Container className="relative py-14 sm:py-20 lg:py-24">
   <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
    <div><p className="font-ui text-xs tracking-[0.12em] text-ash">AI SYSTEMS AND AUTOMATION FOR YOUR BUSINESS</p>
     <h1 className="font-display mt-6 text-[3.3rem] leading-[0.98] tracking-tight sm:text-[4.5rem] xl:text-[6rem]">Your business,<br/><span className="text-[#a7bad2]">made easier.</span></h1>
     <p className="mt-7 max-w-lg text-base leading-relaxed text-muted sm:text-lg">{site.description}</p>
     <div className="mt-8 flex flex-wrap gap-3"><Button href="/#solutions" className="!h-12 !px-6">See our packages <span aria-hidden="true" className="ml-6">↗</span></Button><Button href={whatsappHref("Hello Zentra, I would like to discuss what my business needs.")} variant="secondary" className="!h-12 !px-6">Tell us what you need</Button></div>
     <p className="mt-5 text-xs text-ash">Know the cost and what you will get before we start.</p>
    </div>
    <div className="system-board relative overflow-hidden rounded-2xl border border-line bg-raised px-6 py-7 sm:px-8 sm:py-8">
     <div className="flex justify-between gap-3 text-[9px] tracking-[0.09em] text-ash"><span>HOW IT CAN WORK</span><span className="text-[#a7bad2]">Less stress. More time.</span></div>
     <div className="relative mt-10 mb-9 space-y-5"><div className="absolute top-7 bottom-7 left-[21px] border-l border-dashed border-[#607c9d]" aria-hidden="true"/>
      {[['01','A customer contacts you','Through WhatsApp, your app, or your website.'],['02','You have their details','Their name and enquiry are saved in one place.'],['03','They get a reply','A reply or reminder is sent automatically.']].map(([n,title,copy]) => <div key={n} className="relative flex items-center gap-4"><span className="font-ui grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-[#101925] text-xs text-[#a7bad2]">{n}</span><div className="flex-1 rounded-lg border border-hairline bg-elevated p-4"><p className="font-ui text-sm">{title}</p><p className="mt-1 text-[11px] leading-relaxed text-ash">{copy}</p></div></div>)}
     </div>
     <div className="flex items-end justify-between border-t border-hairline pt-5"><p className="text-xs leading-relaxed text-muted">Less chasing messages.<br/><span className="text-text">More time for customers.</span></p><LogoMark className="!h-8 !w-7 text-[#829cba]"/></div>
     <p className="mt-3 text-right text-[8px] text-ash">An example of how this could work</p>
    </div>
   </div>
  </Container>
 </section>;
}
