"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { GA_ID } from "@/lib/analytics";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function clientId() {
  const key = "zentra_cid";
  const existing = window.localStorage.getItem(key);
  if (existing && /^\d+\.\d+$/.test(existing)) return existing;
  const id = `${Math.floor(Math.random() * 1_000_000_0000)}.${Math.floor(Date.now() / 1000)}`;
  window.localStorage.setItem(key, id);
  return id;
}

function sessionId() {
  const key = "zentra_sid";
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const id = String(Math.floor(Date.now() / 1000));
  window.sessionStorage.setItem(key, id);
  return id;
}

function sendPageView(path: string) {
  const params = new URLSearchParams({
    v: "2",
    tid: GA_ID,
    cid: clientId(),
    sid: sessionId(),
    sct: "1",
    seg: "1",
    en: "page_view",
    dl: window.location.origin + path,
    dt: document.title,
    _s: "1",
  });

  const firstParty = `/api/ga/collect?${params.toString()}`;
  const img = new Image();
  img.src = firstParty;
}

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GA_ID || !pathname || pathname.startsWith("/ops")) return;
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
    window.gtag?.("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pathname,
    });
    sendPageView(pathname);
  }, [pathname]);

  return null;
}
