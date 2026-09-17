export type PackageId = "starter" | "growth" | "scale";

export type Package = {
  id: PackageId;
  name: string;
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
    description: "A strong digital foundation for small businesses.",
    price: "250,000",
    currency: "₦",
    priceCaption: "Starting from",
    billing: "One-time project",
    features: [
      "Professional landing page",
      "Basic business website setup",
      "Basic AI / automation setup",
      "Lead & contact capture",
      "WhatsApp integration",
      "Mobile responsive design",
      "Deployment",
    ],
    cta: "Get Started",
  },
  {
    id: "growth",
    name: "Growth",
    description: "Turn your digital presence into a business system.",
    price: "650,000",
    currency: "₦",
    priceCaption: "Starting from",
    billing: "One-time project",
    badge: "Most chosen",
    featured: true,
    features: [
      "Full functional website",
      "AI assistant",
      "WhatsApp OR Instagram automation",
      "Lead capture system",
      "CRM / basic customer management",
      "Business process automation",
      "Analytics & tracking",
      "Deployment & basic training",
    ],
    cta: "Choose Growth",
  },
  {
    id: "scale",
    name: "Scale",
    description: "A fully customized technology system for established businesses.",
    price: "1,500,000",
    currency: "₦",
    pricePrefix: "From",
    billing: "Scoped after a conversation",
    features: [
      "High-end custom website / web application",
      "Advanced AI assistant",
      "WhatsApp & Instagram automation",
      "Advanced business automation",
      "CRM / customer management system",
      "Custom integrations",
      "Dashboards & reporting",
      "Custom software where required",
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
