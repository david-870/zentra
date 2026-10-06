export type Project = {
  slug: string;
  name: string;
  type: string;
  problem: string;
  built: string;
  stack: string[];
  href?: string;
};

/**
 * Real work only. Do not invent clients, quotes, or results.
 */
export const projects: Project[] = [
  {
    slug: "setglobaltech",
    name: "Set Global Tech",
    type: "Business website",
    problem:
      "A solar and inverter company in Ilorin needed a site so homes and businesses could see packages, past installs, and request a quote.",
    built:
      "A mobile-friendly marketing site with packages, a quote form that continues on WhatsApp, and galleries of installations.",
    stack: ["HTML", "CSS", "JavaScript"],
    href: "https://github.com/david-870/setglobaltech",
  },
  {
    slug: "balotech",
    name: "BaloTech Gadget Hub",
    type: "Shop + WhatsApp checkout",
    problem: "A gadget store needed customers to browse on their phone and the owner to manage stock without a laptop.",
    built: "A product catalogue, cart, WhatsApp checkout, and a mobile admin for photos, stock and orders.",
    stack: ["React", "Vite", "Node.js", "Express"],
    href: "https://github.com/david-870/balotech-gadget-hub",
  },
  {
    slug: "upskill",
    name: "UpSkill Tech Institute",
    type: "Institute website",
    problem: "A training institute needed a clear site for courses, prices and how the programme works.",
    built: "A course site students can use to understand the offer and join.",
    stack: ["HTML", "CSS", "JavaScript"],
    href: "https://upskilltechinstitute.com",
  },
  {
    slug: "frozen-food",
    name: "Frozen food store",
    type: "Business website",
    problem: "A frozen-food business needed a simple site so people can see products and get in touch.",
    built: "A mobile-friendly storefront for products and contact.",
    stack: ["HTML", "CSS", "JavaScript"],
  },
];
