"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Dropzone } from "@/components/shared/Dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadBlob, safeFilename, stem } from "@/lib/files";

type Crop = { x: number; y: number; w: number; h: number };
type Fit = { scale: number; offsetX: number; offsetY: number };

const CANVAS_W = 720;
const CANVAS_H = 420;
const MAX_EDGE = 8000;

export function ImageResizerTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fitRef = useRef<Fit>({ scale: 1, offsetX: 0, offsetY: 0 });
  const anchorRef = useRef<{ x: number; y: number } | null>(null);
  const [fileName, setFileName] = useState("");
  const [url, setUrl] = useState("");
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [quality, setQuality] = useState(0.9);
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, w: 0, h: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !natural.w) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scale = Math.min(CANVAS_W / image.width, CANVAS_H / image.height);
    const drawW = image.width * scale;
    const drawH = image.height * scale;
    const offsetX = (CANVAS_W - drawW) / 2;
    const offsetY = (CANVAS_H - drawH) / 2;
    fitRef.current = { scale, offsetX, offsetY };
    const dark = document.documentElement.classList.contains("dark");
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = dark ? "#05040a" : "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.drawImage(image, offsetX, offsetY, drawW, drawH);
    ctx.strokeStyle = dark ? "#38bdf8" : "#7c3aed";
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX + crop.x * scale, offsetY + crop.y * scale, crop.w * scale, crop.h * scale);
  }, [crop, natural, url]);

  const load = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    setError("");
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      setFileName(file.name);
      setUrl(objectUrl);
      setNatural({ w: image.width, h: image.height });
      setWidth(image.width);
      setHeight(image.height);
      setCrop({ x: 0, y: 0, w: image.width, h: image.height });
    };
    image.onerror = () => setError("This image could not be decoded.");
    image.src = objectUrl;
  };

  const pointToImage = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * CANVAS_W;
    const py = ((event.clientY - rect.top) / rect.height) * CANVAS_H;
    const fit = fitRef.current;
    const image = imageRef.current;
    if (!image) return { x: 0, y: 0 };
    return {
      x: clamp((px - fit.offsetX) / fit.scale, 0, image.width),
      y: clamp((py - fit.offsetY) / fit.scale, 0, image.height),
    };
  };

  const exportImage = () => {
    const image = imageRef.current;
    if (!image) return;
    const out = document.createElement("canvas");
    out.width = clamp(Math.round(width), 1, MAX_EDGE);
    out.height = clamp(Math.round(height), 1, MAX_EDGE);
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, crop.x, crop.y, Math.max(1, crop.w), Math.max(1, crop.h), 0, 0, out.width, out.height);
    const mime = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
    out.toBlob(
      (blob) => {
        if (!blob) {
          setError("This browser could not encode that format.");
          return;
        }
        downloadBlob(blob, safeFilename(stem(fileName), format === "jpeg" ? "jpg" : format));
      },
      mime,
      quality,
    );
  };

  if (!url) {
    return (
      <div className="space-y-3">
        <Dropzone accept="image/*" title="Drop an image to resize" detail="Crop and export stay in the browser." onFiles={(files) => {
          const file = files[0];
          if (file) load(file);
        }} />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  const ratio = natural.h ? natural.w / natural.h : 1;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="h-auto w-full touch-none rounded-xl border bg-background"
        aria-label="Image preview. Drag to crop."
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          anchorRef.current = pointToImage(event);
        }}
        onPointerMove={(event) => {
          if (!anchorRef.current) return;
          const current = pointToImage(event);
          const x = Math.min(anchorRef.current.x, current.x);
          const y = Math.min(anchorRef.current.y, current.y);
          const w = Math.abs(current.x - anchorRef.current.x);
          const h = Math.abs(current.y - anchorRef.current.y);
          if (w > 4 && h > 4) setCrop({ x, y, w, h });
        }}
        onPointerUp={() => {
          anchorRef.current = null;
        }}
      />
      <div className="space-y-3">
        <label className="block text-sm">
          Width
          <Input
            className="mt-1"
            type="number"
            min={1}
            max={MAX_EDGE}
            value={width}
            onChange={(event) => {
              const next = clamp(Number(event.target.value) || 1, 1, MAX_EDGE);
              setWidth(next);
              if (lock) setHeight(clamp(Math.round(next / ratio), 1, MAX_EDGE));
            }}
          />
        </label>
        <label className="block text-sm">
          Height
          <Input
            className="mt-1"
            type="number"
            min={1}
            max={MAX_EDGE}
            value={height}
            onChange={(event) => {
              const next = clamp(Number(event.target.value) || 1, 1, MAX_EDGE);
              setHeight(next);
              if (lock) setWidth(clamp(Math.round(next * ratio), 1, MAX_EDGE));
            }}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={lock} onChange={(event) => setLock(event.target.checked)} />
          Lock aspect ratio
        </label>
        <label className="block text-sm">
          Format
          <select
            className="glass-inset mt-1 h-10 w-full rounded-lg border px-3 text-sm"
            value={format}
            onChange={(event) => setFormat(event.target.value as "png" | "jpeg" | "webp")}
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </label>
        {format !== "png" ? (
          <label className="block text-sm">
            Quality {Math.round(quality * 100)}%
            <input
              className="mt-2 w-full"
              type="range"
              min={0.4}
              max={1}
              step={0.01}
              value={quality}
              onChange={(event) => setQuality(Number(event.target.value))}
            />
          </label>
        ) : null}
        <Button className="w-full" onClick={exportImage}>
          Download
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setCrop({ x: 0, y: 0, w: natural.w, h: natural.h })}
        >
          Reset crop
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            setUrl("");
            imageRef.current = null;
          }}
        >
          Replace image
        </Button>
        <p className="text-xs text-muted-foreground">
          Source {natural.w}×{natural.h}. Drag the preview to crop.
        </p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
