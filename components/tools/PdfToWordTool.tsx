"use client";

import { ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import { Dropzone } from "@/components/shared/Dropzone";
import { Button } from "@/components/ui/button";
import { downloadBlob, safeFilename, stem } from "@/lib/files";
import { formatBytes } from "@/lib/format";

type Direction = "pdf-to-word" | "word-to-pdf";

const SIDES = {
  "pdf-to-word": {
    from: "PDF",
    to: "Word",
    accept: "application/pdf,.pdf",
    title: "Drop a PDF",
    detail: "It becomes a Word file. Text stays in this tab unless you use the fallback.",
    action: "Convert to Word",
  },
  "word-to-pdf": {
    from: "Word",
    to: "PDF",
    accept: ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    title: "Drop a Word file",
    detail: "A .docx becomes a PDF in this tab. The paragraphs are kept.",
    action: "Convert to PDF",
  },
} as const;

export function PdfToWordTool() {
  const [direction, setDirection] = useState<Direction>("pdf-to-word");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const side = SIDES[direction];

  const swap = () => {
    setDirection((current) => (current === "pdf-to-word" ? "word-to-pdf" : "pdf-to-word"));
    setFile(null);
    setPreview("");
    setStatus("");
    setError("");
  };

  const takeFile = (next: File | null) => {
    if (next && !fileMatches(next, direction)) {
      setError(direction === "pdf-to-word" ? "Drop a PDF for this direction." : "Drop a .docx for this direction.");
      return;
    }
    setFile(next);
    setPreview("");
    setError("");
    setStatus("");
  };

  const convert = async () => {
    if (!file) return;
    setPending(true);
    setError("");
    setStatus(direction === "pdf-to-word" ? "Reading the text layer…" : "Building the PDF…");
    try {
      if (direction === "pdf-to-word") await convertPdfToWord(file, setPreview);
      else await convertWordToPdf(file, setPreview);
      setStatus("Download started.");
    } catch (cause) {
      setStatus("");
      setError(cause instanceof Error ? cause.message : "Conversion failed.");
    } finally {
      setPending(false);
    }
  };

  const convertServer = async () => {
    if (!file || direction !== "pdf-to-word") return;
    setPending(true);
    setError("");
    setStatus("Sending the PDF to the fallback converter…");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/convert/pdf-to-word", { method: "POST", body });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Server conversion failed.");
      }
      downloadBlob(await response.blob(), safeFilename(file.name, "docx"));
      setStatus("Downloaded the server conversion.");
    } catch (cause) {
      setStatus("");
      setError(cause instanceof Error ? cause.message : "Server conversion failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-background p-3 sm:p-4">
      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <FormatTile label="From" value={side.from} />
        <Button variant="outline" size="icon" aria-label="Swap PDF and Word" onClick={swap}>
          <ArrowLeftRight className="size-4" />
        </Button>
        <FormatTile label="To" value={side.to} />
      </div>
      <div className="mt-3">
        {!file ? (
          <Dropzone
            accept={side.accept}
            title={side.title}
            detail={side.detail}
            onFiles={(files) => takeFile(files[0] ?? null)}
          />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => takeFile(null)}>
              Replace
            </Button>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button onClick={() => void convert()} disabled={pending || !file}>
          {pending ? "Working…" : side.action}
        </Button>
        {direction === "pdf-to-word" ? (
          <Button variant="outline" onClick={() => void convertServer()} disabled={pending || !file}>
            Server fallback
          </Button>
        ) : null}
        {status ? <span className="text-sm text-muted-foreground">{status}</span> : null}
      </div>
      {preview ? (
        <pre className="mt-3 max-h-36 overflow-auto rounded-lg bg-background p-3 font-mono text-xs leading-5">{preview}</pre>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FormatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function fileMatches(file: File, direction: Direction): boolean {
  const name = file.name.toLowerCase();
  if (direction === "pdf-to-word") return file.type === "application/pdf" || name.endsWith(".pdf");
  return name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

async function convertPdfToWord(file: File, setPreview: (value: string) => void) {
  const [{ extractPdfPages, hasExtractedText }, { pagesToDocxBytes, docxBlob }] = await Promise.all([
    import("@/lib/pdf/extract"),
    import("@/lib/pdf/docx"),
  ]);
  const pages = await extractPdfPages(await file.arrayBuffer());
  if (!hasExtractedText(pages)) {
    throw new Error("This PDF has no text layer. Scanned pages need OCR, which this tool does not run.");
  }
  const bytes = await pagesToDocxBytes(pages, stem(file.name));
  const lines = pages.flatMap((page) => page.lines).filter(Boolean);
  setPreview(lines.slice(0, 12).join("\n"));
  downloadBlob(docxBlob(bytes), safeFilename(file.name, "docx"));
}

async function convertWordToPdf(file: File, setPreview: (value: string) => void) {
  const { docxToPdfBytes } = await import("@/lib/pdf/word-to-pdf");
  const bytes = await docxToPdfBytes(await file.arrayBuffer());
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  downloadBlob(new Blob([copy], { type: "application/pdf" }), safeFilename(file.name, "pdf"));
  setPreview("The PDF uses the paragraph text from the Word file.");
}
