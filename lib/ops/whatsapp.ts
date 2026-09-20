import { opsConfig } from "@/lib/ops/config";
import { runtimeEnv } from "@/lib/ops/runtime-env";

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
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) {
    digits = `234${digits.slice(1)}`;
  }
  return digits;
}

export async function getWhatsAppDisplayPhone() {
  if (!whatsappConfigured()) return "";
  const response = await fetch(
    `${GRAPH}/${opsConfig.whatsapp.phoneNumberId}?fields=display_phone_number`,
    { headers: { Authorization: `Bearer ${opsConfig.whatsapp.accessToken}` } },
  );
  if (!response.ok) return "";
  const data = (await response.json()) as { display_phone_number?: string };
  return normalizeWaPhone(data.display_phone_number ?? "");
}

export async function sendWhatsAppText(to: string, body: string) {
  return graphSend({ to: normalizeWaPhone(to), type: "text", text: { body, preview_url: false } });
}

export async function sendOwnerPing(body: string) {
  if (!whatsappConfigured()) {
    throw new Error("WhatsApp Cloud API token is not available to this deployment.");
  }
  const to = normalizeWaPhone(opsConfig.ops.notifyPhone);
  if (!to) {
    throw new Error("OPS_NOTIFY_PHONE is empty. Set it to your personal WhatsApp.");
  }

  const from = await getWhatsAppDisplayPhone();
  if (from && (from === to || from.endsWith(to) || to.endsWith(from))) {
    throw new Error(
      "Cloud API cannot message the same WhatsApp number it sends from. Set OPS_NOTIFY_PHONE to your personal WhatsApp.",
    );
  }

  try {
    await sendWhatsAppText(to, body);
    return "text" as const;
  } catch (textError) {
    const template = runtimeEnv("WHATSAPP_NOTIFY_TEMPLATE") || "hello_world";
    const language = runtimeEnv("WHATSAPP_NOTIFY_TEMPLATE_LANG") || "en_US";
    try {
      await sendWhatsAppTemplate(to, template, language, []);
      return "template" as const;
    } catch {
      throw textError;
    }
  }
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
    to: normalizeWaPhone(to),
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
