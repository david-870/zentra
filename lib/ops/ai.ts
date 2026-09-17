import { opsConfig } from "@/lib/ops/config";

type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

export async function completeChat(messages: ChatTurn[]) {
  const { apiKey, baseUrl, model } = opsConfig.ai;
  if (!apiKey) return null;

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 400,
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
