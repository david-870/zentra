import { opsConfig } from "@/lib/ops/config";

const GRAPH = "https://graph.facebook.com/v21.0";

export function whatsappConfigured() {
  return Boolean(opsConfig.whatsapp.accessToken && opsConfig.whatsapp.phoneNumberId);
}

async function graphSend(payload: Record<string, unknown>) {
  if (!whatsappConfigured()) {
    return { id: `local-${Date.now()}` };
  }

  const response = await fetch(`${GRAPH}/${opsConfig.whatsapp.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opsConfig.whatsapp.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`WhatsApp send failed: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as { messages?: { id?: string }[] };
  return { id: data.messages?.[0]?.id };
}

export function normalizeWaPhone(value: string) {
  return value.replace(/\D/g, "");
}

export async function sendWhatsAppText(to: string, body: string) {
  return graphSend({ to: normalizeWaPhone(to), type: "text", text: { body, preview_url: false } });
}

function templateText(value: string) {
  const clean = value.replace(/\s+/g, " ").trim();
  return (clean || "-").slice(0, 512);
}

export async function sendWhatsAppTemplate(to: string, name: string, language: string, bodyParams: string[]) {
  return graphSend({
    to: normalizeWaPhone(to),
    type: "template",
    template: {
      name,
      language: { code: language },
      components:
        bodyParams.length > 0
          ? [
              {
                type: "body",
                parameters: bodyParams.map((text) => ({ type: "text", text: templateText(text) })),
              },
            ]
          : undefined,
    },
  });
}

export async function sendWhatsAppList(
  to: string,
  body: string,
  button: string,
  rows: { id: string; title: string; description?: string }[],
) {
  return graphSend({
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: body },
      action: {
        button,
        sections: [{ title: "Zentra", rows }],
      },
    },
  });
}

export function parseIncoming(payload: unknown) {
  const root = payload as {
    entry?: {
      changes?: {
        value?: {
          messages?: {
            id: string;
            from: string;
            type?: string;
            text?: { body?: string };
            interactive?: {
              type?: string;
              button_reply?: { id?: string; title?: string };
              list_reply?: { id?: string; title?: string };
            };
          }[];
          contacts?: { profile?: { name?: string }; wa_id?: string }[];
        };
      }[];
    }[];
  };

  const entries = root.entry ?? [];
  for (const entry of entries) {
    const value = entry.changes?.[0]?.value;
    const message = value?.messages?.[0];
    if (!message?.id || !message.from) continue;

    const interactive =
      message.interactive?.list_reply?.title ||
      message.interactive?.button_reply?.title ||
      message.interactive?.list_reply?.id ||
      message.interactive?.button_reply?.id;
    const text = (message.text?.body || interactive || "").trim();
    if (!text) continue;

    return {
      id: message.id,
      from: message.from,
      name: value?.contacts?.[0]?.profile?.name,
      text,
    };
  }

  return null;
}
