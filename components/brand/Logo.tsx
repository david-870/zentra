import { cn } from "@/lib/cn";

const logoSource = "/brand/zentra-logo.jpeg";

/** Show the original artwork through a viewport; never redraw the brand. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="375 280 330 225" className={cn("h-8 w-12 shrink-0", className)} aria-hidden="true">
      <svg x="375" y="280" width="330" height="225" viewBox="375 280 330 225" overflow="hidden">
        <image href={logoSource} width="1080" height="1080" />
      </svg>
    </svg>
  );
}

export function Logo({ className, variant = "compact" }: { className?: string; variant?: "compact" | "full" }) {
  if (variant === "full") {
    return (
      <svg viewBox="200 275 680 500" role="img" aria-label="Zentra — Build. Automate. Grow." className={cn("h-auto w-56 max-w-full", className)}>
        <image href={logoSource} width="1080" height="1080" />
      </svg>
    );
  }
  return (
    <span role="img" aria-label="Zentra" className={cn("inline-flex max-w-full items-center gap-2", className)}>
      <LogoMark />
      <svg viewBox="210 530 665 175" className="h-8 w-[122px]" aria-hidden="true">
        <image href={logoSource} width="1080" height="1080" />
      </svg>
    </span>
  );
}

