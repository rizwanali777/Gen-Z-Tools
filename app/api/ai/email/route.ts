import { NextResponse } from "next/server";
import { generateWithHuggingFace } from "@/lib/hf";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const LIMIT = 2000;
const TONES = ["professional", "friendly", "firm", "apologetic"] as const;
const PURPOSES = ["reply", "follow-up", "thank-you", "decline", "meeting"] as const;

export async function POST(request: Request) {
  if (!rateLimit(`email:${clientKey(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many email requests. Try again shortly." }, { status: 429 });
  }

  const token = process.env.HUGGINGFACE_API_KEY;
  if (!token) {
    return NextResponse.json(
      { error: "This deployment has no Hugging Face token yet. Add HUGGINGFACE_API_KEY to enable AI tools." },
      { status: 503 },
    );
  }

  let bullets = "";
  let tone = "professional";
  let purpose = "reply";
  try {
    const body = (await request.json()) as { bullets?: unknown; tone?: unknown; purpose?: unknown };
    bullets = typeof body.bullets === "string" ? body.bullets.trim() : "";
    if (typeof body.tone === "string" && TONES.includes(body.tone as (typeof TONES)[number])) tone = body.tone;
    if (typeof body.purpose === "string" && PURPOSES.includes(body.purpose as (typeof PURPOSES)[number])) {
      purpose = body.purpose;
    }
  } catch {
    return NextResponse.json({ error: "Send JSON with the bullet points." }, { status: 400 });
  }

  if (!bullets) return NextResponse.json({ error: "Add a few bullet points first." }, { status: 400 });
  if (bullets.length > LIMIT) {
    return NextResponse.json({ error: `Keep the notes under ${LIMIT} characters.` }, { status: 400 });
  }

  const model = process.env.HF_EMAIL_MODEL || "Qwen/Qwen2.5-7B-Instruct";
  try {
    const text = await generateWithHuggingFace({
      token,
      model,
      maxTokens: 700,
      system:
        "You write short professional emails. Use only the facts in the notes. Do not invent names, prices, dates, or promises. If a name is missing, write [Name]. Start with a Subject line, then the email. Return only the email.",
      user: `Purpose: ${purpose}\nTone: ${tone}\nNotes:\n${bullets}`,
    });
    return NextResponse.json({ text });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "The email model did not respond.";
    const status = message.includes("warming up") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
