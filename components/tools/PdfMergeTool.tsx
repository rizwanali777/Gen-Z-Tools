"use client";

import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Dropzone } from "@/components/shared/Dropzone";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/files";
import { formatBytes } from "@/lib/format";

type Item = {
  id: string;
  file: File;
  pages: number | null;
  error?: string;
};

export function PdfMergeTool() {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const dragIndex = useRef<number | null>(null);

  const addFiles = async (files: File[]) => {
    const pdfs = files.filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length !== files.length) setError("Only PDF files can be merged.");
    else setError("");
    const next: Item[] = [];
    for (const file of pdfs) {
      const item: Item = { id: crypto.randomUUID(), file, pages: null };
      try {
        const { countPdfPages } = await import("@/lib/pdf/merge");
        item.pages = await countPdfPages(file);
      } catch {
        item.error = "Locked or unreadable";
      }
      next.push(item);
    }
    setItems((current) => [...current, ...next].slice(0, 30));
  };

  const move = (index: number, direction: -1 | 1) => {
    setItems((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      const [row] = copy.splice(index, 1);
      if (!row) return current;
      copy.splice(target, 0, row);
      return copy;
    });
  };

  const merge = async () => {
    const ready = items.filter((item) => !item.error);
    if (ready.length < 2) {
      setError("Add at least two readable PDFs.");
      return;
    }
    setPending(true);
    setError("");
    setStatus("Merging pages…");
    try {
      const { mergePdfFiles } = await import("@/lib/pdf/merge");
      const result = await mergePdfFiles(ready.map((item) => item.file));
      const copy = new Uint8Array(result.bytes.byteLength);
      copy.set(result.bytes);
      downloadBlob(new Blob([copy], { type: "application/pdf" }), "merged.pdf");
      setStatus(`Downloaded ${result.pageCount} pages.`);
    } catch (cause) {
      setStatus("");
      setError(cause instanceof Error ? cause.message : "Could not merge these PDFs.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <Dropzone
          accept="application/pdf,.pdf"
          multiple
          title="Drop PDFs to merge"
          detail="They stay in this tab. Order is the merge order."
          onFiles={(files) => void addFiles(files)}
        />
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={item.id}
                draggable
                onDragStart={() => {
                  dragIndex.current = index;
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  const from = dragIndex.current;
                  dragIndex.current = null;
                  if (from === null || from === index) return;
                  setItems((current) => {
                    const copy = [...current];
                    const [row] = copy.splice(from, 1);
                    if (!row) return current;
                    copy.splice(index, 0, row);
                    return copy;
                  });
                }}
                className="flex items-center gap-2 rounded-xl border bg-background px-2 py-2"
              >
                <GripVertical className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="w-6 font-mono text-xs text-muted-foreground">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(item.file.size)}
                    {item.pages !== null ? ` · ${item.pages} pages` : ""}
                    {item.error ? ` · ${item.error}` : ""}
                  </span>
                </span>
                <Button variant="ghost" size="icon" aria-label="Move up" onClick={() => move(index, -1)}>
                  <ChevronUp className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Move down" onClick={() => move(index, 1)}>
                  <ChevronDown className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove file"
                  onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
          <Dropzone
            compact
            multiple
            accept="application/pdf,.pdf"
            title="Add more PDFs"
            detail="Up to 30 files."
            onFiles={(files) => void addFiles(files)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => void merge()} disabled={pending}>
              {pending ? "Merging…" : "Merge and download"}
            </Button>
            <Button variant="ghost" onClick={() => setItems([])}>
              Clear
            </Button>
            {status ? <span className="text-sm text-muted-foreground">{status}</span> : null}
          </div>
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
