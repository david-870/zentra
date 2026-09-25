import { home } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function About() {
  const copy = home.why;

  return (
    <Section id="about" className="border-b border-hairline">
      <Container>
        <p className="font-ui text-sm text-ash">{copy.eyebrow}</p>
        <h2 className="font-display mt-4 max-w-[16ch] text-[2.75rem] leading-none text-pretty sm:text-6xl lg:text-[4.5rem]">
          {copy.headline}
        </h2>
        <p className="mt-5 max-w-2xl text-muted">{copy.support}</p>
        <p className="mt-6 max-w-2xl text-pretty">{copy.trust}</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {copy.points.map((point) => (
            <li key={point.title} className="rounded-xl border border-line bg-raised p-8">
              <h3 className="font-ui text-xl font-medium tracking-tight">{point.title}</h3>
              <p className="mt-3 text-sm text-muted">{point.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
