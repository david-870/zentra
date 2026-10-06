import { home } from "@/content/home";
import { projects } from "@/content/projects";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function Projects() {
  const copy = home.projects;

  return (
    <Section id="projects" className="border-b border-hairline">
      <Container>
        <p className="font-ui text-sm text-ash">{copy.eyebrow}</p>
        <h2 className="font-display mt-4 max-w-[16ch] text-[2.75rem] leading-none text-pretty sm:text-6xl lg:text-[4.5rem]">
          {copy.headline}
        </h2>
        <p className="mt-5 max-w-2xl text-muted">{copy.support}</p>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {projects.map((item) => (
            <li key={item.slug} className="flex flex-col rounded-xl border border-line bg-raised p-8">
              <p className="font-ui text-sm text-ash">{item.type}</p>
              <h3 className="font-ui mt-3 text-2xl font-medium tracking-tight text-pretty">{item.name}</h3>
              <p className="mt-4 text-sm text-pretty text-muted">{item.problem}</p>
              <p className="mt-3 text-sm text-pretty">{item.built}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {item.stack.map((tech) => (
                  <li key={tech} className="rounded-full bg-elevated px-2.5 py-1 text-xs text-muted">
                    {tech}
                  </li>
                ))}
              </ul>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 text-sm text-muted hover:text-text"
                >
                  {item.href.includes("github.com") ? "View on GitHub" : "Visit site"}
                </a>
              ) : (
                <p className="mt-6 text-sm text-muted">Private / in use by the business.</p>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
