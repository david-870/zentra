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
      <div className="rounded-xl border border-line bg-raised p-8" role="status">
        <p className="font-ui text-2xl font-medium tracking-tight">We have the enquiry.</p>
        <p className="mt-3 text-muted">
          We will review it and come back with a next step. If you need to talk now, WhatsApp is still open.
        </p>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="font-ui mt-6 inline-flex h-11 items-center justify-center rounded-lg border border-line bg-elevated px-4 text-sm font-medium sm:h-9"
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
    "font-ui mt-2 h-11 w-full rounded-lg border border-line bg-raised px-3.5 text-sm text-text outline-none transition-colors focus:border-text";

  return (
    <form onSubmit={onSubmit} className="relative grid gap-5" noValidate>
      <p className="font-ui text-sm text-ash">Or send an enquiry</p>
      <div>
        <label htmlFor="name" className="font-ui text-sm text-muted">
          Name
        </label>
        <input id="name" name="name" autoComplete="name" className={field} aria-invalid={Boolean(errors.name)} />
        {errors.name ? (
          <p className="mt-2 text-xs text-error" role="alert">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="business" className="font-ui text-sm text-muted">
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
          <p className="mt-2 text-xs text-error" role="alert">
            {errors.business}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="need" className="font-ui text-sm text-muted">
          What do you need help with?
        </label>
        <textarea id="need" name="need" rows={4} className={cn(field, "h-auto py-3 resize-y")} aria-invalid={Boolean(errors.need)} />
        {errors.need ? (
          <p className="mt-2 text-xs text-error" role="alert">
            {errors.need}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="font-ui text-sm text-muted">
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
            <p className="mt-2 text-xs text-error" role="alert">
              {errors.phone}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="email" className="font-ui text-sm text-muted">
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
            <p className="mt-2 text-xs text-error" role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="website" className="font-ui text-sm text-muted">
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
        <p className="text-sm text-error" role="alert">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="font-ui inline-flex h-11 items-center justify-center rounded-lg border border-line bg-elevated px-4 text-sm font-medium text-text transition-colors hover:border-text disabled:opacity-60 sm:h-9"
      >
        {status === "submitting" ? "Sending" : home.cta.button}
      </button>
    </form>
  );
}
