import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Terms",
  description: `Terms for using the ${site.name} website and sending an enquiry.`,
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms" updated="Last updated September 2026">
      <p>
        This website is provided by {site.name} to describe our services and to receive business enquiries. Using the
        site means you agree to these terms.
      </p>
      <p>
        Information on this site is general. Package prices, scope and timelines are confirmed only after we have
        understood your work. Sending an enquiry does not create a contract.
      </p>
      <p>
        When you submit the enquiry form, you confirm that the details are accurate and that we may use your name,
        business information, phone or WhatsApp number, email address, and any website you choose to share, to respond
        to you. A website is not required.
      </p>
      <p>
        We take care with the site, but we do not guarantee that it will always be available or free of errors. We may
        update these terms; the date above shows the current version.
      </p>
      <p>
        Nigerian law governs these terms. For a question about a project or these terms, use the contact form on this
        website.
      </p>
    </LegalPage>
  );
}
