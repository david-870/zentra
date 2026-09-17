import { home } from "@/content/home";
import { work } from "@/content/work";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function Work() {
  return (
    <Section id="work" className="border-b border-line">
      <Container>
        <h2 className="font-display max-w-[16ch] text-[1.75rem] text-pretty sm:text-5xl">{home.work.headline}</h2>
        <p className="mt-5 max-w-2xl text-muted">{home.work.support}</p>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {work.map((item) => (
            <li key={item.slug} className="border border-line bg-raised p-5 sm:p-7">
              <h3 className="font-display text-xl text-pretty sm:text-2xl">{item.name}</h3>
              <p className="mt-3 text-sm text-muted">{item.line}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
