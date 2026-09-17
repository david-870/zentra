import { home } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function About() {
  const copy = home.why;

  return (
    <Section id="about" className="border-b border-line">
      <Container>
        <p className="text-[0.7rem] tracking-[0.18em] text-muted uppercase">{copy.eyebrow}</p>
        <h2 className="font-display mt-4 max-w-[18ch] text-3xl sm:text-5xl">{copy.headline}</h2>
        <p className="mt-5 max-w-2xl text-muted">{copy.support}</p>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {copy.points.map((point) => (
            <li key={point.title} className="border border-line bg-raised p-7 sm:p-8">
              <h3 className="font-display text-2xl">{point.title}</h3>
              <p className="mt-3 text-sm text-muted">{point.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
