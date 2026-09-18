import { home } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  const { hero } = home;

  return (
    <section
      id="top"
      className="sticky top-16 z-0 flex min-h-[calc(100svh-4rem)] items-center border-b border-line sm:top-[4.25rem] sm:min-h-[calc(100svh-4.25rem)]"
    >
      <Container className="w-full py-10 sm:py-16">
        <h1 className="font-display rise text-[2.35rem] sm:text-6xl lg:text-7xl">
          {hero.headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="rise rise-2 mt-5 max-w-[34rem] text-[0.95rem] text-pretty text-muted sm:mt-6 sm:text-lg">
          {hero.support}
        </p>
        <p className="rise rise-2 mt-4 text-[0.7rem] tracking-[0.16em] text-muted uppercase">
          {hero.line}
        </p>
        <div className="rise rise-3 mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
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
