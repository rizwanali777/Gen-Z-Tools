import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const LIMIT = 4000;

export async function POST(request: Request) {
  if (!rateLimit(`grammar:${clientKey(request)}`, 30, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many grammar requests. Try again shortly." }, { status: 429 });
  }

  const token = process.env.HUGGINGFACE_API_KEY;
  if (!token) {
    return NextResponse.json(
      { error: "This deployment has no Hugging Face token yet. Add HUGGINGFACE_API_KEY to enable AI tools." },
      { status: 503 },
    );
  }

  let text = "";
  try {
    const body = (await request.json()) as { text?: unknown };
    text = typeof body.text === "string" ? body.text.trim() : "";
  } catch {
    return NextResponse.json({ error: "Send JSON with a text field." }, { status: 400 });
  }

  if (!text) return NextResponse.json({ error: "Enter some text to fix." }, { status: 400 });
  if (text.length > LIMIT) {
    return NextResponse.json({ error: `Keep the passage under ${LIMIT} characters.` }, { status: 400 });
  }

  const model = process.env.HF_GRAMMAR_MODEL || "vennify/t5-base-grammar-correction";
  try {
    const upstream = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-wait-for-model": "true",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: { max_new_tokens: 512 },
        options: { wait_for_model: true },
      }),
      signal: AbortSignal.timeout(55_000),
    });
    const payload: unknown = await upstream.json().catch(() => null);
    if (upstream.status === 503) {
      return NextResponse.json(
        { error: "The grammar model is warming up. Wait a few seconds and try again." },
        { status: 503 },
      );
    }
    const correction = readCorrection(payload);
    if (!upstream.ok || !correction) {
      const detail = readError(payload);
      return NextResponse.json({ error: detail || "The grammar model did not return a correction." }, { status: 502 });
    }
    return NextResponse.json({ text: correction });
  } catch {
    return NextResponse.json({ error: "The grammar request timed out or could not reach the model." }, { status: 502 });
  }
}

function readCorrection(payload: unknown): string | null {
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
  if (payload && typeof payload === "object" && "error" in payload) {
    const value = (payload as { error?: unknown }).error;
    if (typeof value === "string") return value.slice(0, 300);
  }
  return "";
}
