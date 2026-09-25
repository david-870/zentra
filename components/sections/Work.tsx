import { home } from "@/content/home";
import { work } from "@/content/work";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function Work() {
  return (
    <Section id="work" className="border-b border-hairline">
      <Container>
        <h2 className="font-display max-w-[14ch] text-[2.75rem] leading-none text-pretty sm:text-6xl lg:text-[4.5rem]">
          {home.work.headline}
        </h2>
        <p className="mt-5 max-w-2xl text-muted">{home.work.support}</p>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {work.map((item) => (
            <li key={item.slug} className="rounded-xl border border-line bg-raised p-8">
              <h3 className="font-ui text-2xl font-medium tracking-tight text-pretty">{item.name}</h3>
              <p className="mt-3 text-sm text-muted">{item.line}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
