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
  if (existing) return existing;
  const id = crypto.randomUUID();
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
  const url = `/api/ga/collect?${params.toString()}`;
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url);
    return;
  }
  void fetch(url, { method: "POST", keepalive: true });
}

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GA_ID || !pathname || pathname.startsWith("/ops")) return;
    window.gtag?.("event", "page_view", { page_path: pathname });
    sendPageView(pathname);
  }, [pathname]);

  return null;
}
