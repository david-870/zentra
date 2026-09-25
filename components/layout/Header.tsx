"use client";

import { useState } from "react";
import Link from "next/link";
import { navLinks, primaryCta } from "@/content/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-bg">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-6 sm:px-8">
        <Link href="/#top" aria-label="Zentra home" className="min-w-0 shrink text-text" onClick={() => setOpen(false)}>
          <Logo className="text-[1.05rem] sm:text-[1.15rem]" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-ui text-sm font-medium tracking-[0.02em] text-muted transition-colors hover:text-text"
            >
              {item.label}
            </Link>
          ))}
          <Button href={primaryCta.href}>{primaryCta.label}</Button>
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <Button href={primaryCta.href} className="hidden sm:inline-flex">
            {primaryCta.label}
          </Button>
          <button
            type="button"
            className="font-ui shrink-0 text-sm font-medium text-text"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-hairline bg-bg px-6 py-6 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-ui py-3 text-lg text-text"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button href={primaryCta.href} className="mt-4 w-full sm:hidden">
              {primaryCta.label}
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
