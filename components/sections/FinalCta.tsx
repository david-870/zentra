import { home } from "@/content/home";
import { site } from "@/content/site";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { whatsappHref } from "@/lib/whatsapp";

export function FinalCta() {
  return (
    <Section id="contact" className="pb-24 sm:pb-28">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 className="font-display text-[1.75rem] text-pretty sm:text-5xl">{home.cta.headline}</h2>
          <p className="mt-4 text-pretty text-muted">{home.cta.support}</p>
          <p className="mt-4 text-sm text-pretty text-muted">{home.cta.next}</p>
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-white px-5 text-[0.8125rem] font-medium tracking-[0.06em] text-black uppercase sm:w-auto"
          >
            WhatsApp {site.whatsapp.display}
          </a>
        </div>
        <div className="lg:col-span-7">
          <InquiryForm />
        </div>
      </Container>
    </Section>
  );
}
