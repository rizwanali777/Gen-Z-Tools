"use client";

import { useEffect, useState } from "react";
import { Dropzone } from "@/components/shared/Dropzone";
import { Button } from "@/components/ui/button";
import { downloadBlob, safeFilename } from "@/lib/files";
import { formatBytes } from "@/lib/format";

const MAX_BYTES = 8 * 1024 * 1024;

export function RemoveBgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const current = sourceUrl;
    return () => {
      if (current) URL.revokeObjectURL(current);
    };
  }, [sourceUrl]);

  useEffect(() => {
    const current = resultUrl;
    return () => {
      if (current) URL.revokeObjectURL(current);
    };
  }, [resultUrl]);

  const select = (next: File) => {
    if (!next.type.startsWith("image/")) {
      setError("Choose a PNG, JPEG, or WebP image.");
      return;
    }
    if (next.size > MAX_BYTES) {
      setError("Images must be 8 MB or smaller.");
      return;
    }
    setError("");
    setResultUrl("");
    setFile(next);
    setSourceUrl(URL.createObjectURL(next));
  };

  const remove = async () => {
    if (!file) return;
    setPending(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/ai/remove-bg", { method: "POST", body });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Background removal failed.");
      }
      const blob = await response.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Background removal failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-3">
      {!file ? (
        <Dropzone
          accept="image/png,image/jpeg,image/webp,image/*"
          title="Drop a photo"
          detail="The image is sent only when you press Remove background."
          onFiles={(files) => {
            const next = files[0];
            if (next) select(next);
          }}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {file.name} · {formatBytes(file.size)}. Pressing the button uploads this image to the AI proxy.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <figure>
              <figcaption className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Original</figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sourceUrl} alt="Original upload" className="max-h-72 w-full rounded-xl border object-contain" />
            </figure>
            <figure>
              <figcaption className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Cutout</figcaption>
              <div className="checkerboard flex min-h-40 items-center justify-center rounded-xl border">
                {resultUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resultUrl} alt="Subject with background removed" className="max-h-72 w-full object-contain" />
                ) : (
                  <p className="px-4 text-center text-sm text-muted-foreground">The transparent PNG appears here.</p>
                )}
              </div>
            </figure>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void remove()} disabled={pending}>
              {pending ? "Removing…" : "Remove background"}
            </Button>
            <Button
              variant="outline"
              disabled={!resultUrl}
              onClick={async () => {
                const response = await fetch(resultUrl);
                downloadBlob(await response.blob(), safeFilename(file.name, "png"));
              }}
            >
              Download PNG
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setFile(null);
                setSourceUrl("");
                setResultUrl("");
              }}
            >
              Replace
            </Button>
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
