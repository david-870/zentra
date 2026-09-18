"use client";

import { useState } from "react";
import { home } from "@/content/home";
import { whatsappHref } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";

type Status = "idle" | "submitting" | "error" | "success";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value: string) {
  return value.replace(/\D/g, "").length >= 10;
}

export function InquiryForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  if (status === "success") {
    return (
      <div className="border border-line bg-raised p-8" role="status">
        <p className="font-display text-2xl">We have the enquiry.</p>
        <p className="mt-3 text-muted">
          We will review it and come back with a next step. If you need to talk now, WhatsApp is still open.
        </p>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-11 items-center justify-center border border-line px-5 text-[0.8125rem] font-medium tracking-[0.06em] uppercase"
        >
          WhatsApp
        </a>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const business = String(data.get("business") ?? "").trim();
    const need = String(data.get("need") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const website = String(data.get("website") ?? "").trim();
    const trap = String(data.get("company_fax") ?? "").trim();
    const nextErrors: Record<string, string> = {};

    if (name.length < 2) nextErrors.name = "Enter your name.";
    if (business.length < 2) nextErrors.business = "Enter your business name.";
    if (need.length < 8) nextErrors.need = "Tell us what you need help with.";
    if (!isPhone(phone)) nextErrors.phone = "Enter a phone or WhatsApp number.";
    if (!isEmail(email)) nextErrors.email = "Enter an email address.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      setMessage("");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, business, need, phone, email, website, company_fax: trap }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(payload.error ?? "Could not send the enquiry. Use WhatsApp instead.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setMessage("Could not send the enquiry. Use WhatsApp instead.");
    }
  }

  const field =
    "mt-2 w-full border border-line bg-bg px-3 py-3 text-sm text-text outline-none transition-colors focus:border-text";

  return (
    <form onSubmit={onSubmit} className="relative grid gap-5" noValidate>
      <p className="text-[0.7rem] tracking-[0.18em] text-muted uppercase">Or send an enquiry</p>
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
        <label htmlFor="business" className="text-xs tracking-[0.08em] uppercase">
          Business
        </label>
        <input
          id="business"
          name="business"
          autoComplete="organization"
          className={field}
          aria-invalid={Boolean(errors.business)}
        />
        {errors.business ? (
          <p className="mt-2 text-xs text-muted" role="alert">
            {errors.business}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="need" className="text-xs tracking-[0.08em] uppercase">
          What do you need help with?
        </label>
        <textarea id="need" name="need" rows={4} className={cn(field, "resize-y")} aria-invalid={Boolean(errors.need)} />
        {errors.need ? (
          <p className="mt-2 text-xs text-muted" role="alert">
            {errors.need}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="text-xs tracking-[0.08em] uppercase">
            Phone / WhatsApp number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={field}
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone ? (
            <p className="mt-2 text-xs text-muted" role="alert">
              {errors.phone}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="email" className="text-xs tracking-[0.08em] uppercase">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={field}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? (
            <p className="mt-2 text-xs text-muted" role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="website" className="text-xs tracking-[0.08em] uppercase">
          Company website <span className="normal-case tracking-normal text-muted">(if you have one)</span>
        </label>
        <input
          id="website"
          name="website"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="Optional"
          className={field}
        />
      </div>

      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="company_fax">Company fax</label>
        <input id="company_fax" name="company_fax" tabIndex={-1} autoComplete="off" />
      </div>

      {message ? (
        <p className="text-sm text-muted" role="alert">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex min-h-11 items-center justify-center bg-white px-5 text-[0.8125rem] font-medium tracking-[0.06em] text-black uppercase transition-colors hover:bg-text disabled:opacity-60"
      >
        {status === "submitting" ? "Sending" : home.cta.button}
      </button>
    </form>
  );
}
