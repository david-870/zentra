"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { GA_ID } from "@/lib/analytics";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GA_ID || !pathname || pathname.startsWith("/ops")) return;
    window.gtag?.("config", GA_ID, { page_path: pathname, anonymize_ip: true });
  }, [pathname]);

  return null;
}
