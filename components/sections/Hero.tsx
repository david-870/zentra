import { home } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  const { hero } = home;

  return (
    <section id="top" className="relative overflow-hidden border-b border-hairline">
      <div aria-hidden="true" className="glow-drift pointer-events-none absolute top-0 left-[-20%] h-[28rem] w-[140%]" />
      <Container className="relative w-full py-16 sm:py-24 lg:py-32">
        <h1 className="font-display rise max-w-[12ch] text-[2.75rem] leading-none sm:text-[3.5rem] lg:text-[4.8rem] xl:text-[6rem]">
          {hero.headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="rise rise-2 mt-6 max-w-xl text-lg leading-snug text-pretty text-muted sm:text-xl">
          {hero.support}
        </p>
        <p className="rise rise-2 mt-5 text-sm text-ash">{hero.line}</p>
        <div className="rise rise-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button href={hero.primary.href} className="w-full sm:w-auto">
            {hero.primary.label}
          </Button>
          <Button href={hero.secondary.href} variant="secondary" className="w-full sm:w-auto">
            {hero.secondary.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
