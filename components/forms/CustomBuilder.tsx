"use client";

import { useState } from "react";
import { customServices } from "@/content/services";
import { cn } from "@/lib/cn";

export function CustomBuilder() {
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  function consult() {
    const labels = customServices.filter(item => selected.includes(item.id)).map(item => item.label);
    if (!labels.length) { setError("Choose at least one thing you need help with."); return; }
    window.dispatchEvent(new CustomEvent("zentra:custom", { detail: labels }));
    document.getElementById("contact")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <div>
    <fieldset><legend className="sr-only">What your business needs</legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {customServices.map(service => {
          const checked = selected.includes(service.id);
          return <button key={service.id} type="button" aria-pressed={checked}
            onClick={() => { setError(""); setSelected(current => checked ? current.filter(id => id !== service.id) : [...current, service.id]); }}
            className={cn("font-ui flex min-h-12 items-center gap-3 rounded-lg border px-4 py-3 text-left text-xs transition-colors", checked ? "border-[#a7bad2] bg-[#101925] text-text" : "border-line bg-bg text-muted hover:text-text")}>
            <span className={cn("size-3.5 shrink-0 rounded border", checked ? "border-text bg-text" : "border-ash")} aria-hidden="true" />{service.label}
          </button>;
        })}
      </div>
    </fieldset>
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <button type="button" onClick={consult} className="font-ui min-h-12 rounded-lg bg-text px-6 text-sm text-black">Request a consultation ↗</button>
      <p className="text-xs text-ash" role="status">{selected.length} selected</p>
    </div>
    {error && <p className="mt-3 text-xs text-error" role="alert">{error}</p>}
    <p className="mt-4 text-xs leading-relaxed text-muted">Your choices go into your enquiry for you to review. Nothing is sent automatically.</p>
  </div>;
}
