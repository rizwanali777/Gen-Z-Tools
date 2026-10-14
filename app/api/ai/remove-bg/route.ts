import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!rateLimit(`rmbg:${clientKey(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many background removals. Try again shortly." }, { status: 429 });
  }

  const token = process.env.HUGGINGFACE_API_KEY;
  if (!token) {
    return NextResponse.json(
      { error: "This deployment has no Hugging Face token yet. Add HUGGINGFACE_API_KEY to enable AI tools." },
      { status: 503 },
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach an image file." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are accepted." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Images must be 8 MB or smaller." }, { status: 413 });
  }

  const model = process.env.HF_RMBG_MODEL || "briaai/RMBG-1.4";
  try {
    const upstream = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type,
        "x-wait-for-model": "true",
      },
      body: await file.arrayBuffer(),
      signal: AbortSignal.timeout(55_000),
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    if (upstream.status === 503) {
      return NextResponse.json(
        { error: "The background model is warming up. Wait a few seconds and try again." },
        { status: 503 },
      );
    }
    if (!upstream.ok || contentType.includes("application/json") || contentType.includes("text/")) {
      const detail = await upstream.text();
      return NextResponse.json({ error: summarize(detail) }, { status: 502 });
    }

    const bytes = await upstream.arrayBuffer();
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType || "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Background removal timed out or could not reach the model." }, { status: 502 });
  }
}

function summarize(detail: string): string {
  try {
    const parsed = JSON.parse(detail) as { error?: unknown };
    if (typeof parsed.error === "string") return parsed.error.slice(0, 300);
  } catch {
    return detail.slice(0, 300) || "The background model did not return an image.";
  }
  return "The background model did not return an image.";
}
