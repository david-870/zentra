import { opsConfig } from "@/lib/ops/config";

type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

function includeAiEnv() {
  return String(process.env.AI_API_KEY ?? "").trim();
}

export async function completeChat(messages: ChatTurn[]) {
  const apiKey = includeAiEnv() || opsConfig.ai.apiKey;
  const baseUrl = opsConfig.ai.baseUrl.replace(/\/$/, "");
  const model = opsConfig.ai.model;
  if (!apiKey || !baseUrl.startsWith("https://")) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 400,
        messages,
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
