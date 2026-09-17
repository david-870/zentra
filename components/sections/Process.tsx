import { home } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function Process() {
  return (
    <Section id="process" className="border-b border-line">
      <Container>
        <h2 className="font-display text-3xl sm:text-5xl">{home.process.headline}</h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-3">
          {home.process.steps.map((step) => (
            <li key={step.n} className="border-t border-line pt-5">
              <p className="text-sm text-muted">{step.n}</p>
              <h3 className="mt-3 text-xl">{step.title}</h3>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
