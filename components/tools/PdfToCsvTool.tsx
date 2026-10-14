"use client";

import { useState } from "react";
import { Dropzone } from "@/components/shared/Dropzone";
import { Button } from "@/components/ui/button";
import { toCsv } from "@/lib/csv";
import { downloadBlob, safeFilename } from "@/lib/files";
import { formatBytes } from "@/lib/format";

export function PdfToCsvTool() {
  const [file, setFile] = useState<File | null>(null);
  const [includePage, setIncludePage] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState("");

  const convert = async () => {
    if (!file) return;
    setPending(true);
    setError("");
    setStatus("Reading text positions…");
    try {
      const { extractPdfPages, hasExtractedText } = await import("@/lib/pdf/extract");
      const pages = await extractPdfPages(await file.arrayBuffer());
      if (!hasExtractedText(pages)) {
        throw new Error("This PDF has no text layer to place into cells.");
      }
      const width = Math.max(1, ...pages.flatMap((page) => page.rows.map((row) => row.length)));
      const header = [
        ...(includePage ? ["page"] : []),
        ...Array.from({ length: width }, (_, index) => `column_${index + 1}`),
      ];
      const body = pages.flatMap((page, pageIndex) =>
        page.rows.map((row) => {
          const cells = [...row];
          while (cells.length < width) cells.push("");
          return includePage ? [String(pageIndex + 1), ...cells] : cells;
        }),
      );
      const csv = toCsv([header, ...body]);
      setPreview(csv.split(/\r\n/).slice(0, 8).join("\n"));
      downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), safeFilename(file.name, "csv"));
      setStatus(`Downloaded ${body.length} rows.`);
    } catch (cause) {
      setStatus("");
      setError(cause instanceof Error ? cause.message : "Could not build a CSV.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-3">
      {!file ? (
        <Dropzone
          accept="application/pdf,.pdf"
          title="Drop a PDF with a text layer"
          detail="Columns are inferred from gaps between text items."
          onFiles={(files) => {
            setFile(files[0] ?? null);
            setPreview("");
            setError("");
            setStatus("");
          }}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background px-3 py-2">
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includePage}
                onChange={(event) => setIncludePage(event.target.checked)}
              />
              Include page column
            </label>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => void convert()} disabled={pending}>
              {pending ? "Extracting…" : "Download CSV"}
            </Button>
            <Button variant="ghost" onClick={() => setFile(null)}>
              Replace
            </Button>
          </div>
          {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
          {preview ? (
            <pre className="max-h-36 overflow-auto rounded-lg bg-background p-3 font-mono text-xs">{preview}</pre>
          ) : null}
        </>
      )}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
