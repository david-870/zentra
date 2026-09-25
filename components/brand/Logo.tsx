import { cn } from "@/lib/cn";

/** Geometric Z — 45° diagonal, no frame. Used as the Z in Zentra. */
export const logoMarkPath =
  "M0 0h51v8L11 48h40v8H0v-8l40-40H0V0Z";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 51 56" className={cn("h-[1em] w-[0.91em] shrink-0", className)} aria-hidden="true">
      <path fill="currentColor" d={logoMarkPath} />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  wordClassName,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
}) {
  return (
    <span className={cn("font-ui inline-flex max-w-full items-center text-[1.2rem] font-medium leading-none tracking-tight", className)}>
      <LogoMark className={markClassName} />
      <span className={cn("-ml-[0.06em]", wordClassName)}>entra</span>
    </span>
  );
}
