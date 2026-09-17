"use client";

import { useState } from "react";
import Link from "next/link";
import { navLinks, primaryCta } from "@/content/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-5 sm:h-[4.25rem] sm:px-8">
        <Link href="/#top" aria-label="Zentra home" className="text-text" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[0.75rem] tracking-[0.12em] text-muted uppercase transition-colors hover:text-text"
            >
              {item.label}
            </Link>
          ))}
          <Button href={primaryCta.href} className="min-h-10 px-4">
            {primaryCta.label}
          </Button>
        </nav>

        <button
          type="button"
          className="min-h-11 text-[0.75rem] tracking-[0.12em] uppercase lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-bg px-5 py-6 lg:hidden">
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
