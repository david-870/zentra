export const customServices = [
  { id: "website", label: "Website" },
  { id: "web-app", label: "Web app" },
  { id: "mobile-app", label: "Mobile app" },
  { id: "ai-assistant", label: "AI assistant" },
  { id: "whatsapp", label: "WhatsApp replies and follow-ups" },
  { id: "instagram", label: "Instagram replies and follow-ups" },
  { id: "crm", label: "Customer and sales tracking" },
  { id: "automation", label: "Automate daily tasks" },
  { id: "software", label: "Custom business software" },
  { id: "marketing", label: "Digital marketing" },
  { id: "seo", label: "Google search visibility (SEO)" },
] as const;

export type CustomServiceId = (typeof customServices)[number]["id"];

export function isCustomServiceId(value: string): value is CustomServiceId {
  return customServices.some((item) => item.id === value);
}
