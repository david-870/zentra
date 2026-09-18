"use client";

import { useState } from "react";
import Link from "next/link";
import { navLinks, primaryCta } from "@/content/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
      {open ? (
        <path fill="none" stroke="currentColor" strokeWidth="1.6" d="M5 5l14 14M19 5 5 19" />
      ) : (
        <path fill="none" stroke="currentColor" strokeWidth="1.6" d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-[1120px] items-center justify-end px-4 sm:h-[4.25rem] sm:px-8">
        <button
          type="button"
          className="absolute top-1/2 left-4 z-10 flex size-11 -translate-y-1/2 items-center justify-center sm:left-8 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <MenuIcon open={open} />
        </button>

        <Link
          href="/#top"
          aria-label="Zentra home"
          className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-text"
          onClick={() => setOpen(false)}
        >
          <Logo className="text-[1.05rem] sm:text-[1.2rem]" />
        </Link>

        <nav aria-label="Primary" className="hidden max-w-[calc(50%-3rem)] flex-wrap items-center justify-end gap-x-5 gap-y-1 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[0.7rem] tracking-[0.12em] text-muted uppercase transition-colors hover:text-text xl:text-[0.75rem]"
            >
              {item.label}
            </Link>
          ))}
          <Button href={primaryCta.href} className="min-h-10 px-4">
            {primaryCta.label}
          </Button>
        </nav>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-bg px-4 py-6 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-display py-3 text-3xl"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button href={primaryCta.href} className="mt-4 w-full">
              {primaryCta.label}
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
