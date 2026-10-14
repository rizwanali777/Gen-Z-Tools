const CHAT_URL = "https://router.huggingface.co/v1/chat/completions";

export async function generateWithHuggingFace(options: {
  token: string;
  model: string;
  system: string;
  user: string;
  maxTokens: number;
}): Promise<string> {
  const chat = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model,
      messages: [
        { role: "system", content: options.system },
        { role: "user", content: options.user },
      ],
      max_tokens: options.maxTokens,
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(55_000),
  });

  const payload: unknown = await chat.json().catch(() => null);
  if (chat.status === 503) {
    throw new Error("The model is warming up. Wait a few seconds and try again.");
  }
  const chatText = readChat(payload);
  if (chat.ok && chatText) return chatText;

  const fallback = await fetch(`https://router.huggingface.co/hf-inference/models/${options.model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.token}`,
      "Content-Type": "application/json",
      "x-wait-for-model": "true",
    },
    body: JSON.stringify({
      inputs: `${options.system}\n\n${options.user}`,
      parameters: { max_new_tokens: options.maxTokens, temperature: 0.4, return_full_text: false },
      options: { wait_for_model: true },
    }),
    signal: AbortSignal.timeout(55_000),
  });
  const fallbackPayload: unknown = await fallback.json().catch(() => null);
  if (fallback.status === 503) {
    throw new Error("The model is warming up. Wait a few seconds and try again.");
  }
  const generated = readGenerated(fallbackPayload);
  if (!fallback.ok || !generated) {
    throw new Error(readError(payload) || readError(fallbackPayload) || "The model did not return any text.");
  }
  return generated;
}

function readChat(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || !("choices" in payload)) return null;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== "object") return null;
  const content = (choices[0] as { message?: { content?: unknown } }).message?.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  if (!Array.isArray(content)) return null;
  const text = content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part && typeof part.text === "string") return part.text;
      return "";
    })
    .join("")
    .trim();
  return text || null;
}

function readGenerated(payload: unknown): string | null {
  if (typeof payload === "string" && payload.trim()) return payload.trim();
  if (Array.isArray(payload)) {
    const first: unknown = payload[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (first && typeof first === "object" && "generated_text" in first) {
      const value = (first as { generated_text?: unknown }).generated_text;
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  if (payload && typeof payload === "object" && "generated_text" in payload) {
    const value = (payload as { generated_text?: unknown }).generated_text;
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function readError(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  if ("error" in payload) {
    const value = (payload as { error?: unknown }).error;
    if (typeof value === "string") return value.slice(0, 300);
    if (value && typeof value === "object" && "message" in value && typeof value.message === "string") {
      return value.message.slice(0, 300);
    }
  }
  return "";
}
