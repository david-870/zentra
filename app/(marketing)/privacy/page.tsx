import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects and uses information from the website enquiry form.`,
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="Last updated September 2026">
      <p>
        {site.name} (“we”) uses this website to explain our work and to receive enquiries from businesses that may want
        to work with us.
      </p>
      <p>
        If you send the enquiry form, we collect the information you enter: your name, business name, a short note on
        what you need help with, your phone or WhatsApp number, and your email address. A company website is optional.
        You do not need a website to contact us.
      </p>
      <p>
        We use this information only to understand your request and to reply with a next step. We do not sell it, and we
        do not use it for unrelated marketing lists.
      </p>
      <p>
        The form is stored so we can follow up. Access is limited to people handling enquiries for {site.name}.
      </p>
      <p>
        If you contact us on WhatsApp instead, that conversation is handled on WhatsApp according to Meta’s terms, and
        we keep what we need to continue the discussion.
      </p>
      <p>
        To ask what we hold, or to ask us to update or delete an enquiry, use the contact form on this website or
        WhatsApp.
      </p>
    </LegalPage>
  );
}
