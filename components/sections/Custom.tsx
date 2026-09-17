import { home } from "@/content/home";
import { CustomBuilder } from "@/components/forms/CustomBuilder";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function Custom() {
  const copy = home.custom;

  return (
    <Section id="custom" className="border-b border-line">
      <Container>
        <h2 className="font-display max-w-[16ch] text-3xl sm:text-5xl">{copy.headline}</h2>
        <p className="mt-5 max-w-2xl text-muted">{copy.body}</p>
        <div className="mt-10">
          <CustomBuilder />
        </div>
      </Container>
    </Section>
  );
}
