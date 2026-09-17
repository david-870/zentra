"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { packages, isPackageId } from "@/content/packages";
import { customServices } from "@/content/services";
import { home } from "@/content/home";
import { parseServiceIds, readCustomServices } from "@/lib/custom-services";
import { whatsappHref } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { site } from "@/content/site";

type Status = "idle" | "error" | "success";

export function InquiryForm() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("package");
  const serviceQuery = searchParams.getAll("services").join(",");
  const fromQuery = parseServiceIds(serviceQuery);
  const initialPackage = requested === "custom" || (requested && isPackageId(requested)) ? requested : "";

  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [interest, setInterest] = useState(initialPackage);
  const [stored, setStored] = useState<string[]>([]);
  const picked = fromQuery.length > 0 ? fromQuery : stored;

  useEffect(() => {
    if (requested === "custom" || (requested && isPackageId(requested))) {
      setInterest(requested);
    }
    if (requested === "custom" && fromQuery.length === 0) {
      setStored(readCustomServices());
    }
  }, [requested, serviceQuery, fromQuery.length]);

  const labels = useMemo(
    () => Object.fromEntries(customServices.map((item) => [item.id, item.label])),
    [],
  );

  if (status === "success") {
    return (
      <div className="border border-line bg-raised p-8" role="status">
        <p className="font-display text-2xl">Continue in WhatsApp.</p>
        <p className="mt-3 text-muted">If it didn't open, tap the number below.</p>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-11 items-center justify-center bg-white px-5 text-[0.8125rem] font-medium tracking-[0.06em] text-black uppercase"
        >
          WhatsApp {site.whatsapp.display}
        </a>
      </div>
    );
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const note = String(data.get("note") ?? "").trim();
    const nextErrors: Record<string, string> = {};

    if (name.length < 2) nextErrors.name = "Enter your name.";
    if (company.length < 2) nextErrors.company = "Enter your company.";
    if (!interest) nextErrors.interest = "Choose a starting point.";
    if (interest === "custom" && picked.length === 0) {
      nextErrors.services = "Select at least one service.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      return;
    }

    const pack =
      packages.find((item) => item.id === interest)?.name ??
      (interest === "custom" ? "Build your own" : interest);
    const lines = [`Hello, I'm ${name} from ${company}.`, `I'm interested in ${pack}.`];
    if (interest === "custom" && picked.length > 0) {
      lines.push(`Services: ${picked.map((id) => labels[id] ?? id).join(", ")}.`);
    }
    if (note) lines.push(note);

    window.open(whatsappHref(lines.join(" ")), "_blank", "noopener,noreferrer");
    setStatus("success");
  }

  const field =
    "mt-2 w-full border border-line bg-bg px-3 py-3 text-sm text-text outline-none transition-colors focus:border-text";

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      <div>
        <label htmlFor="name" className="text-xs tracking-[0.08em] uppercase">
          Name
        </label>
        <input id="name" name="name" autoComplete="name" className={field} aria-invalid={Boolean(errors.name)} />
        {errors.name ? (
          <p className="mt-2 text-xs text-muted" role="alert">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="company" className="text-xs tracking-[0.08em] uppercase">
          Company
        </label>
        <input
          id="company"
          name="company"
          autoComplete="organization"
          className={field}
          aria-invalid={Boolean(errors.company)}
        />
        {errors.company ? (
          <p className="mt-2 text-xs text-muted" role="alert">
            {errors.company}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="interest" className="text-xs tracking-[0.08em] uppercase">
          Which package?
        </label>
        <select
          id="interest"
          name="interest"
          className={field}
          value={interest}
          onChange={(event) => setInterest(event.target.value)}
        >
          <option value="">Select</option>
          {packages.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
          <option value="custom">Build your own</option>
        </select>
        {errors.interest ? (
            <p className="mt-2 text-xs text-muted" role="alert">
              Choose a package.
            </p>
        ) : null}
      </div>

      {interest === "custom" ? (
        <div>
          <p className="text-xs tracking-[0.08em] uppercase">Selected services</p>
          {picked.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {picked.map((id) => (
                <li key={id}>{labels[id] ?? id}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">None yet — choose above.</p>
          )}
          <input type="hidden" name="services" value={picked.join(",")} />
          {errors.services ? (
            <p className="mt-2 text-xs text-muted" role="alert">
              {errors.services}
            </p>
          ) : null}
        </div>
      ) : null}

      <div>
        <label htmlFor="note" className="text-xs tracking-[0.08em] uppercase">
          What do you need?
        </label>
        <textarea id="note" name="note" rows={4} className={cn(field, "resize-y")} />
      </div>

      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center bg-white px-5 text-[0.8125rem] font-medium tracking-[0.06em] text-black uppercase transition-colors hover:bg-text"
      >
        {home.cta.button}
      </button>
    </form>
  );
}
