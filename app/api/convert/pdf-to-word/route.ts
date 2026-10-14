import { NextResponse } from "next/server";
import { DOCX_TYPE, pagesToDocxBytes } from "@/lib/pdf/docx";
import { extractPdfOnServer } from "@/lib/pdf/extract-server";
import { hasExtractedText } from "@/lib/pdf/text-layout";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request) {
  if (!rateLimit(`pdf:${clientKey(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many conversions. Try the local converter or wait a moment." }, { status: 429 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach a PDF file." }, { status: 400 });
  }
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return NextResponse.json({ error: "Only PDF files are accepted." }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "PDFs must be 20 MB or smaller for the server fallback." }, { status: 413 });
  }

  try {
    const data = new Uint8Array(await file.arrayBuffer());
    const pages = await extractPdfOnServer(data);
    if (!hasExtractedText(pages)) {
      return NextResponse.json(
        { error: "This PDF has no text layer. Scanned pages need OCR, which this fallback does not run." },
        { status: 422 },
      );
    }
    const bytes = await pagesToDocxBytes(pages, file.name.replace(/\.pdf$/i, ""));
    const filename = `${file.name.replace(/\.pdf$/i, "").replace(/[^a-z0-9-_]+/gi, "-").slice(0, 80) || "converted"}.docx`;
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": DOCX_TYPE,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "The server could not read this PDF. Try the local converter, or remove a password first." },
      { status: 422 },
    );
  }
}
