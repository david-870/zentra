import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main id="main" className="relative overflow-hidden bg-bg">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,rgba(0,117,255,0.22),transparent_62%)]"
      />
      <Container className="relative max-w-2xl py-16 sm:py-24">
        <p className="font-ui text-sm text-ash">{updated}</p>
        <h1 className="font-display mt-4 text-[2.75rem] leading-none text-pretty sm:text-6xl">{title}</h1>
        <div className="mt-10 space-y-5 text-sm leading-relaxed text-muted">{children}</div>
      </Container>
    </main>
  );
}
