import { home } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function About() {
  return (
    <Section id="about" className="border-b border-line py-12 sm:py-16">
      <Container>
        <p className="text-xl text-muted sm:text-2xl">{home.about.line}</p>
      </Container>
    </Section>
  );
}
