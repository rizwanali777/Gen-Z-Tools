import { NextResponse } from "next/server";
import { generateWithHuggingFace } from "@/lib/hf";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const LIMIT = 3000;
const TARGETS = ["general", "coding", "image", "research"] as const;

export async function POST(request: Request) {
  if (!rateLimit(`prompt:${clientKey(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many prompt requests. Try again shortly." }, { status: 429 });
  }

  const token = process.env.HUGGINGFACE_API_KEY;
  if (!token) {
    return NextResponse.json(
      { error: "This deployment has no Hugging Face token yet. Add HUGGINGFACE_API_KEY to enable AI tools." },
      { status: 503 },
    );
  }

  let prompt = "";
  let target = "general";
  try {
    const body = (await request.json()) as { prompt?: unknown; target?: unknown };
    prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (typeof body.target === "string" && TARGETS.includes(body.target as (typeof TARGETS)[number])) {
      target = body.target;
    }
  } catch {
    return NextResponse.json({ error: "Send JSON with a prompt." }, { status: 400 });
  }

  if (!prompt) return NextResponse.json({ error: "Write a rough prompt first." }, { status: 400 });
  if (prompt.length > LIMIT) {
    return NextResponse.json({ error: `Keep the prompt under ${LIMIT} characters.` }, { status: 400 });
  }

  const model = process.env.HF_PROMPT_MODEL || process.env.HF_EMAIL_MODEL || "Qwen/Qwen2.5-7B-Instruct";
  try {
    const text = await generateWithHuggingFace({
      token,
      model,
      maxTokens: 900,
      system:
        "You rewrite a rough prompt into a structured prompt for another model. Include role, goal, context, constraints, output format, and a short quality check. Do not answer the task itself. Return only the improved prompt.",
      user: `Target: ${target}\nRough prompt:\n${prompt}`,
    });
    return NextResponse.json({ text });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "The prompt model did not respond.";
    const status = message.includes("warming up") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
