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
    <main id="main" className="relative z-10 bg-bg">
      <Container className="max-w-2xl py-16 sm:py-24">
        <p className="text-[0.7rem] tracking-[0.18em] text-muted uppercase">{updated}</p>
        <h1 className="font-display mt-4 text-[1.75rem] text-pretty sm:text-5xl">{title}</h1>
        <div className="mt-10 space-y-5 text-sm leading-relaxed text-muted">{children}</div>
      </Container>
    </main>
  );
}
