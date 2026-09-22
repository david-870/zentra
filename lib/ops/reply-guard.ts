const MAX_INBOUND = 2000;
const MAX_OUTBOUND = 3500;

export function clipInbound(text: string) {
  return text.replace(/\u0000/g, "").trim().slice(0, MAX_INBOUND);
}

export function sanitizeCustomerReply(text: string) {
  let out = text.replace(/\u0000/g, "").trim();
  out = out.replace(/(?:^|\n)(HANDOFF|QUALIFY)\s*$/g, "").trim();
  out = out.replace(/ZENTRA WHATSAPP[\s\S]*/gi, "").trim();
  out = out.replace(/\b(AI_API_KEY|WHATSAPP_ACCESS_TOKEN|OPS_PASSWORD|sk-[A-Za-z0-9_-]{8,}|Bearer\s+\S+)/gi, "[redacted]");
  out = out.replace(/\b(?:\+?234|0)\d{10}\b/g, "");
  out = out.replace(/\b\d{11,15}\b/g, (match) => (match.length >= 11 ? "" : match));
  out = out.replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_OUTBOUND);
  return out || "I'm Ada from Zentra. How can I help?";
}

export function safeChatHistory(history: { role: "user" | "assistant"; content: string }[]) {
  return history
    .filter((item) => item.content.trim() && !/ZENTRA WHATSAPP/i.test(item.content))
    .slice(-6)
    .map((item) => ({
      role: item.role,
      content: item.content.replace(/ZENTRA WHATSAPP[\s\S]*/gi, "").trim().slice(0, 800),
    }))
    .filter((item) => item.content);
}

export function isWeakFallback(text: string) {
  return (
    /tell me what you need, or i can get someone from the team/i.test(text) ||
    /i didn't catch that clearly/i.test(text)
  );
}
