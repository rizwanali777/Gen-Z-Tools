"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Dropzone } from "@/components/shared/Dropzone";
import { Button } from "@/components/ui/button";
import {
  acceptedImage,
  assertImageLimits,
  backgroundRemovalSupport,
  friendlyRemovalError,
  IMGLY_LICENSE,
  IMGLY_PACKAGE,
  IMGLY_SOURCE,
  IMGLY_VERSION,
  MAX_IMAGE_BYTES,
  removalProgressLabel,
  removeImageBackground,
  SITE_SOURCE,
  subscribeRemovalProgress,
} from "@/lib/background-removal";
import { downloadBlob, safeFilename } from "@/lib/files";
import { formatBytes } from "@/lib/format";

type ProgressState = {
  label: string;
  ratio: number;
};

export function RemoveBgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [sourceUrl, setSourceUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [supportError, setSupportError] = useState("");
  const [checking, setChecking] = useState(false);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({ label: "Starting", ratio: 0 });
  const selectId = useRef(0);
  const runId = useRef(0);
  const sourceUrlRef = useRef("");
  const resultUrlRef = useRef("");

  useEffect(() => {
    setSupportError(backgroundRemovalSupport() ?? "");
  }, []);

  useEffect(() => {
    const amounts = new Map<string, { current: number; total: number }>();
    let frame = 0;
    const unsubscribe = subscribeRemovalProgress((key, current, total) => {
      amounts.set(key, { current, total: Math.max(total, 1) });
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setProgress(summarizeProgress(amounts));
      });
    });
    return () => {
      unsubscribe();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    sourceUrlRef.current = sourceUrl;
  }, [sourceUrl]);

  useEffect(() => {
    resultUrlRef.current = resultUrl;
  }, [resultUrl]);

  useEffect(() => {
    return () => {
      selectId.current += 1;
      runId.current += 1;
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const replaceSource = (nextUrl: string) => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = nextUrl;
    setSourceUrl(nextUrl);
  };

  const clearResult = () => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = "";
    setResultUrl("");
    setResultBlob(null);
  };

  const select = async (next: File) => {
    if (pending || checking) return;
    const id = ++selectId.current;
    setError("");
    if (!acceptedImage(next)) {
      setError("Use a JPG, PNG, or WebP image.");
      return;
    }
    if (next.size > MAX_IMAGE_BYTES) {
      setError("Images must be 8 MB or smaller.");
      return;
    }
    setChecking(true);
    try {
      const size = await assertImageLimits(next);
      if (selectId.current !== id) return;
      clearResult();
      setFile(next);
      setDimensions(size);
      replaceSource(URL.createObjectURL(next));
    } catch (cause) {
      if (selectId.current !== id) return;
      setError(cause instanceof Error ? cause.message : "This image could not be read.");
    } finally {
      if (selectId.current === id) setChecking(false);
    }
  };

  const reset = () => {
    selectId.current += 1;
    runId.current += 1;
    setChecking(false);
    setPending(false);
    setError("");
    setFile(null);
    setDimensions({ width: 0, height: 0 });
    replaceSource("");
    clearResult();
  };

  const remove = async () => {
    if (!file || pending || supportError) return;
    const id = ++runId.current;
    setPending(true);
    setError("");
    setProgress({ label: "Starting the model", ratio: 0 });
    clearResult();
    try {
      const blob = await removeImageBackground(file);
      if (runId.current !== id) return;
      const url = URL.createObjectURL(blob);
      if (runId.current !== id) {
        URL.revokeObjectURL(url);
        return;
      }
      resultUrlRef.current = url;
      setResultBlob(blob);
      setResultUrl(url);
      setProgress({ label: "Cutout ready", ratio: 1 });
    } catch (cause) {
      if (runId.current !== id) return;
      setError(friendlyRemovalError(cause));
    } finally {
      if (runId.current === id) setPending(false);
    }
  };

  const percent = Math.max(0, Math.min(100, Math.round(progress.ratio * 100)));

  return (
    <div className="space-y-3">
      {supportError ? (
        <p className="text-sm text-destructive" role="alert">
          {supportError}
        </p>
      ) : !file ? (
        <Dropzone
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          title={checking ? "Checking the image" : "Drop a photo"}
          detail="JPG, PNG, or WebP. 8 MB max. The file stays on this device."
          onFiles={(files) => {
            const next = files[0];
            if (next && !supportError) void select(next);
          }}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {file.name} · {formatBytes(file.size)} · {dimensions.width}×{dimensions.height}. The photo is processed in
            this browser.
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
          {pending ? (
            <div>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span aria-live="polite">{progress.label}</span>
                <span>{percent}%</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                aria-label={progress.label}
              >
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void remove()} disabled={pending || Boolean(supportError)}>
              {pending ? "Removing…" : "Remove background"}
            </Button>
            <Button variant="outline" disabled={!resultBlob || !file} onClick={() => resultBlob && file && downloadBlob(resultBlob, safeFilename(file.name, "png"))}>
              Download PNG
            </Button>
            <Button variant="ghost" onClick={reset} disabled={pending}>
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
      <p className="text-xs leading-5 text-muted-foreground">
        Background removal uses {IMGLY_PACKAGE} {IMGLY_VERSION} (GNU AGPL-3.0) and the ISNet FP16 model. The first run
        downloads the model and WASM runtime, then the browser cache keeps them.{" "}
        <a className="underline decoration-border underline-offset-2 hover:text-foreground" href={IMGLY_SOURCE} target="_blank" rel="noreferrer">
          Library source
        </a>
        {" · "}
        <a className="underline decoration-border underline-offset-2 hover:text-foreground" href={IMGLY_LICENSE} target="_blank" rel="noreferrer">
          AGPL-3.0
        </a>
        {" · "}
        <a className="underline decoration-border underline-offset-2 hover:text-foreground" href={SITE_SOURCE} target="_blank" rel="noreferrer">
          Site source
        </a>
        {" · "}
        <Link className="underline decoration-border underline-offset-2 hover:text-foreground" href="/licenses">
          License notice
        </Link>
      </p>
    </div>
  );
}

function summarizeProgress(amounts: Map<string, { current: number; total: number }>): ProgressState {
  const entries = [...amounts.entries()];
  const fetches = entries.filter(([key]) => key.startsWith("fetch:"));
  const computes = entries.filter(([key]) => key.startsWith("compute:"));
  const fetchDone = fetches.length > 0 && fetches.every(([, value]) => value.current >= value.total);
  if (computes.length > 0 && (fetches.length === 0 || fetchDone)) {
    const latest = computes[computes.length - 1];
    return {
      label: removalProgressLabel(latest[0]),
      ratio: latest[1].current / latest[1].total,
    };
  }
  if (fetches.length > 0) {
    const current = fetches.reduce((sum, [, value]) => sum + value.current, 0);
    const total = fetches.reduce((sum, [, value]) => sum + value.total, 0);
    const active = fetches.find(([, value]) => value.current < value.total) ?? fetches[fetches.length - 1];
    return {
      label: removalProgressLabel(active[0]),
      ratio: total > 0 ? current / total : 0,
    };
  }
  return { label: "Starting the model", ratio: 0 };
}
