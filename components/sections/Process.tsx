import { home } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function Process() {
  const copy = home.process;

  return (
    <Section id="process" className="border-b border-line">
      <Container>
        <p className="text-[0.7rem] tracking-[0.18em] text-muted uppercase">{copy.eyebrow}</p>
        <h2 className="font-display mt-4 max-w-[18ch] text-3xl sm:text-5xl">{copy.headline}</h2>
        <p className="mt-5 max-w-2xl text-muted">{copy.support}</p>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {copy.steps.map((step) => (
            <li key={step.n} className="border-t border-line pt-5">
              <p className="text-sm text-muted">{step.n}</p>
              <h3 className="mt-3 text-xl">{step.title}</h3>
              <p className="mt-3 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
