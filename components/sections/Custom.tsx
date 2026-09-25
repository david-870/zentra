import { home } from "@/content/home";
import { CustomBuilder } from "@/components/forms/CustomBuilder";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function Custom() {
  const copy = home.custom;

  return (
    <Section id="custom" className="border-b border-hairline">
      <Container>
        <h2 className="font-display max-w-[14ch] text-[2.75rem] leading-none text-pretty sm:text-6xl lg:text-[4.5rem]">
          {copy.headline}
        </h2>
        <p className="mt-5 max-w-2xl text-muted">{copy.body}</p>
        <div className="mt-10 rounded-xl border border-line bg-raised p-6 sm:p-8">
          <CustomBuilder />
        </div>
      </Container>
    </Section>
  );
}
