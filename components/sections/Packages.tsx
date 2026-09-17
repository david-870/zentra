import { home } from "@/content/home";
import { packages } from "@/content/packages";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { packageWhatsappHref } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 size-3.5 shrink-0 text-muted" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
        d="M2.5 8.2 6.2 12 13.5 4"
      />
    </svg>
  );
}

export function Packages() {
  const copy = home.packages;

  return (
    <Section id="solutions" className="border-b border-line">
      <Container>
        <p className="text-[0.7rem] tracking-[0.18em] text-muted uppercase">{copy.eyebrow}</p>
        <h2 className="font-display mt-4 max-w-[16ch] text-3xl sm:text-5xl">{copy.headline}</h2>
        <p className="mt-5 max-w-xl text-muted">{copy.support}</p>

        <div className="mt-14 grid items-stretch gap-4 lg:grid-cols-3 lg:gap-5">
          {packages.map((item) => (
            <article
              key={item.id}
              className={cn(
                "flex flex-col border border-line bg-raised p-7 transition-colors duration-200 hover:border-muted sm:p-8",
                item.featured && "border-text bg-[#171714] hover:border-text lg:py-9",
              )}
            >
              <div className="min-h-7">
                {item.badge ? (
                  <p className="text-[0.65rem] tracking-[0.16em] text-text uppercase">{item.badge}</p>
                ) : null}
              </div>

              <h3 className="font-display mt-3 text-[2rem] uppercase">{item.name}</h3>
              <p className="mt-3 text-sm text-muted">{item.description}</p>

              <div className="mt-8">
                {item.priceCaption ? (
                  <p className="text-[0.65rem] tracking-[0.16em] text-muted uppercase">{item.priceCaption}</p>
                ) : null}
                <p className="mt-2 flex items-baseline gap-2">
                  {item.pricePrefix ? (
                    <span className="text-sm text-muted">{item.pricePrefix}</span>
                  ) : null}
                  <span className="font-display text-[2.15rem] tracking-tight">
                    {item.currency}
                    {item.price}
                  </span>
                </p>
                <p className="mt-2 text-sm text-muted">{item.billing}</p>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {item.features.map((line) => (
                  <li key={line} className="flex gap-3 text-sm">
                    <Check />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <Button
                href={packageWhatsappHref(item)}
                variant={item.featured ? "primary" : "secondary"}
                className="mt-10 w-full"
              >
                {item.cta}
              </Button>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
