import { opsConfig } from "@/lib/ops/config";

type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

function includeAiEnv() {
  return String(process.env.AI_API_KEY ?? "").trim();
}

export async function completeChat(messages: ChatTurn[]) {
  const apiKey = includeAiEnv() || opsConfig.ai.apiKey;
  const baseUrl = opsConfig.ai.baseUrl;
  const model = opsConfig.ai.model;
  if (!apiKey) return null;

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 900,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider error ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() || null;
}
