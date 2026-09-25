"use client";

import { useMemo, useState } from "react";
import { home } from "@/content/home";
import { customServices } from "@/content/services";
import { customWhatsappHref } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";

export function CustomBuilder() {
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");

  const labels = useMemo(
    () =>
      customServices.filter((item) => selected.includes(item.id)).map((item) => item.label),
    [selected],
  );

  function toggle(id: string) {
    setError("");
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <div>
      <fieldset>
        <legend className="sr-only">Capabilities</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {customServices.map((service) => {
            const checked = selected.includes(service.id);
            return (
              <button
                key={service.id}
                type="button"
                aria-pressed={checked}
                onClick={() => toggle(service.id)}
                className={cn(
                  "font-ui flex min-h-11 items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition-colors duration-200 sm:px-4",
                  checked
                    ? "border-line bg-elevated text-text"
                    : "border-line bg-bg text-muted hover:text-text",
                )}
              >
                <span
                  className={cn(
                    "size-3.5 shrink-0 rounded-[4px] border",
                    checked ? "border-text bg-text" : "border-ash",
                  )}
                  aria-hidden="true"
                />
                {service.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        <a
          href={labels.length > 0 ? customWhatsappHref(labels) : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="font-ui inline-flex h-11 w-full items-center justify-center rounded-lg bg-text px-4 text-sm font-medium text-black transition-colors hover:bg-[#f1f7fe] sm:h-9 sm:w-auto"
          onClick={(event) => {
            if (labels.length === 0) {
              event.preventDefault();
              setError("Choose at least one capability.");
            }
          }}
        >
          {home.custom.cta} →
        </a>
        {error ? (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <p className="mt-5 max-w-md text-sm text-muted">{home.custom.note}</p>
    </div>
  );
}
