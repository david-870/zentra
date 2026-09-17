export const customServices = [
  { id: "website", label: "Website" },
  { id: "web-app", label: "Web Application" },
  { id: "mobile-app", label: "Mobile Application" },
  { id: "ai-assistant", label: "AI Assistant" },
  { id: "whatsapp", label: "WhatsApp Automation" },
  { id: "instagram", label: "Instagram Automation" },
  { id: "crm", label: "CRM" },
  { id: "automation", label: "Business Automation" },
  { id: "software", label: "Custom Software" },
  { id: "marketing", label: "Marketing / Growth" },
] as const;

export type CustomServiceId = (typeof customServices)[number]["id"];

export function isCustomServiceId(value: string): value is CustomServiceId {
  return customServices.some((item) => item.id === value);
}
