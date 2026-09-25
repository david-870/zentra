import { home } from "@/content/home";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { whatsappHref } from "@/lib/whatsapp";

export function FinalCta() {
  return (
    <Section id="contact" className="pb-24 sm:pb-28">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h2 className="font-display text-[2.75rem] leading-none text-pretty sm:text-6xl lg:text-[4.5rem]">
            {home.cta.headline}
          </h2>
          <p className="mt-5 text-pretty text-muted">{home.cta.support}</p>
          <p className="mt-4 text-sm text-pretty text-ash">{home.cta.next}</p>
          <Button href={whatsappHref()} className="mt-8 w-full sm:w-auto">
            WhatsApp
          </Button>
        </div>
        <div className="lg:col-span-7">
          <InquiryForm />
        </div>
      </Container>
    </Section>
  );
}
