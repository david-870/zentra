import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects and uses information submitted through the website enquiry form.`,
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="Last updated September 2026">
      <p>
        This Privacy Policy explains how Zentra [REGISTERED BUSINESS NAME] (“Zentra”, “we”, “us” or “our”) collects and
        uses personal information through this website.
      </p>
      <p>
        If you submit the enquiry form, we collect the information you enter: your name, business name, a short note on
        what you need help with, your phone or WhatsApp number, and your email address. A company website is optional.
        You do not need a website to contact us.
      </p>
      <p>
        We use this information only to understand your request and to reply with a next step. We do not sell it, and we
        do not use it for unrelated marketing lists.
      </p>
      <p>
        Information submitted through the enquiry form is stored so that we can respond to your enquiry and follow up
        where necessary. Access is limited to authorised people handling enquiries for Zentra.
      </p>
      <h2 className="pt-2 text-text">How long information is kept</h2>
      <p>
        We keep enquiry information only for as long as reasonably necessary to respond to your request, manage any
        resulting business relationship, and meet applicable legal or administrative requirements.
      </p>
      <p>
        If you contact us through WhatsApp, your use of WhatsApp is also subject to WhatsApp’s own privacy practices and
        terms. Zentra may retain information from the conversation where reasonably necessary to respond to your enquiry
        or continue a business relationship.
      </p>
      <p>
        This website uses Google Analytics to understand how the public pages are used, such as which pages are visited.
        This may include a shortened IP address and basic device information. We do not use it to sell your data.
      </p>
      <h2 className="pt-2 text-text">Privacy enquiries</h2>
      <p className="text-text">Privacy enquiries: hello@zentra[EMAIL DOMAIN]</p>
      <p>
        You can contact us to request access to, correction of, or deletion of personal information you have submitted.
        You can also use the contact form on this website or WhatsApp.
      </p>
    </LegalPage>
  );
}
