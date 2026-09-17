import { home } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  const { hero } = home;

  return (
    <section id="top" className="border-b border-line">
      <Container className="py-20 sm:py-28">
        <h1 className="font-display rise max-w-[12ch] text-[3rem] sm:text-6xl lg:text-7xl">
          {hero.headline}
        </h1>
        <p className="rise rise-2 mt-6 max-w-[26rem] text-lg text-muted">{hero.support}</p>
        <div className="rise rise-3 mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href={hero.primary.href}>{hero.primary.label}</Button>
          <Button href={hero.secondary.href} variant="secondary">
            {hero.secondary.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
