export type PackageId = "starter" | "growth" | "scale";

export type Package = {
  id: PackageId;
  name: string;
  audience: string;
  description: string;
  price: string;
  currency: string;
  pricePrefix?: string;
  priceCaption?: string;
  billing: string;
  badge?: string;
  featured?: boolean;
  features: string[];
  cta: string;
};

/**
 * Edit packages, prices, and features here only.
 */
export const packages: Package[] = [
  {
    id: "starter",
    name: "Starter",
    audience: "For businesses establishing their online presence.",
    description: "Get found, look credible, and give customers a clear way to reach you.",
    price: "250,000",
    currency: "₦",
    priceCaption: "Starting from",
    billing: "One-time project",
    features: [
      "A professional website that works on a phone",
      "A simple way for customers to contact you",
      "WhatsApp on your site so enquiries come to your phone",
      "A setup that can answer common questions when you are busy",
      "A form so enquiries are not lost in chat",
      "We put the site live for you",
    ],
    cta: "Get Started",
  },
  {
    id: "growth",
    name: "Business",
    audience: "For businesses getting enquiries but struggling to manage leads and repetitive tasks.",
    description: "Keep up with messages, follow people up, and stop doing the same work by hand.",
    price: "650,000",
    currency: "₦",
    priceCaption: "Starting from",
    billing: "One-time project",
    badge: "Most chosen",
    featured: true,
    features: [
      "A full website built around how customers actually find you",
      "WhatsApp or Instagram replies so messages do not pile up",
      "A system to capture enquiries and keep track of leads",
      "A simple customer list so you know who contacted you and when",
      "Automate repetitive tasks such as customer enquiries, follow-ups, bookings and lead management",
      "See how people find you and what they do on your site",
      "We launch it and show your team how to use it",
    ],
    cta: "Choose Business",
  },
  {
    id: "scale",
    name: "Custom",
    audience: "For established businesses that need integrated or custom systems.",
    description: "Connect the way you already work, instead of stacking more disconnected tools.",
    price: "1,500,000",
    currency: "₦",
    pricePrefix: "From",
    billing: "Scoped after a conversation",
    features: [
      "A custom website or web application built around your workflow",
      "WhatsApp and Instagram handled as part of one system",
      "A customer system your team can actually run day to day",
      "Automate work that currently sits across people, chats and spreadsheets",
      "Connect the tools you already use",
      "Dashboards so you can see what is happening without chasing updates",
      "Custom software where a package is not enough",
      "Launch, handover and training for your team",
    ],
    cta: "Start a Conversation",
  },
];

export function isPackageId(value: string): value is PackageId {
  return packages.some((item) => item.id === value);
}

export function packageHref(id: PackageId) {
  return `/?package=${id}#contact`;
}

export function formatPackagePrice(item: Package) {
  const prefix = item.pricePrefix ? `${item.pricePrefix} ` : "";
  return `${prefix}${item.currency}${item.price}`;
}
