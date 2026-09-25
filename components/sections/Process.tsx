import { home } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function Process() {
  const copy = home.process;

  return (
    <Section id="process" className="border-b border-hairline">
      <Container>
        <p className="font-ui text-sm text-ash">{copy.eyebrow}</p>
        <h2 className="font-display mt-4 max-w-[14ch] text-[2.75rem] leading-none text-pretty sm:text-6xl lg:text-[4.5rem]">
          {copy.headline}
        </h2>
        <p className="mt-5 max-w-2xl text-muted">{copy.support}</p>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {copy.steps.map((step) => (
            <li key={step.n} className="border-t border-hairline pt-5">
              <p className="font-ui text-sm text-ash">{step.n}</p>
              <h3 className="font-ui mt-3 text-xl font-medium tracking-tight">{step.title}</h3>
              <p className="mt-3 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
