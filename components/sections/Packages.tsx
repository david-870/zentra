import { home } from "@/content/home";
import { packages } from "@/content/packages";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { packageWhatsappHref } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 size-3.5 shrink-0 text-ash" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        d="M2.5 8.2 6.2 12 13.5 4"
      />
    </svg>
  );
}

export function Packages() {
  const copy = home.packages;

  return (
    <Section id="solutions" className="border-b border-hairline">
      <Container>
        <p className="font-ui text-sm text-ash">{copy.eyebrow}</p>
        <h2 className="font-display mt-4 max-w-[14ch] text-[2.75rem] leading-none text-pretty sm:text-6xl lg:text-[4.5rem]">
          {copy.headline}
        </h2>
        <p className="mt-5 max-w-2xl text-muted">{copy.support}</p>

        <div className="mt-12 grid min-w-0 items-stretch gap-4 lg:grid-cols-3">
          {packages.map((item) => (
            <article
              key={item.id}
              className={cn(
                "flex min-w-0 flex-col rounded-xl border border-line bg-raised p-6 sm:p-8",
                item.featured && "bg-elevated",
              )}
            >
              <div className="min-h-7">
                {item.badge ? (
                  <p className="font-ui inline-flex rounded-full bg-bg px-2.5 py-1 text-xs text-text">{item.badge}</p>
                ) : null}
              </div>

              <h3 className="font-ui mt-4 text-2xl font-medium tracking-tight">{item.name}</h3>
              <p className="mt-3 text-sm text-text">{item.audience}</p>
              <p className="mt-2 text-sm text-muted">{item.description}</p>

              <div className="mt-8">
                {item.priceCaption ? <p className="font-ui text-xs text-ash">{item.priceCaption}</p> : null}
                <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  {item.pricePrefix ? <span className="text-sm text-muted">{item.pricePrefix}</span> : null}
                  <span className="text-[1.75rem] leading-none tracking-[-0.04em] sm:text-[2.15rem]">
                    {item.currency}
                    {item.price}
                  </span>
                </p>
                <p className="mt-2 text-sm text-muted">{item.billing}</p>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {item.features.map((line) => (
                  <li key={line} className="flex gap-3 text-sm text-pretty">
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
