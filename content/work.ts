export type WorkItem = {
  slug: string;
  name: string;
  line: string;
};

/**
 * Swap these for real projects later. Keep each card to a name and one line.
 */
export const work: WorkItem[] = [
  {
    slug: "website",
    name: "Website",
    line: "So people can find you and get in touch.",
  },
  {
    slug: "whatsapp",
    name: "WhatsApp & Instagram",
    line: "So messages don't get missed.",
  },
  {
    slug: "software",
    name: "Software",
    line: "So your team isn't stuck in spreadsheets.",
  },
];
