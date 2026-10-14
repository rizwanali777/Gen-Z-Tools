"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadBlob } from "@/lib/files";

export function QrGeneratorTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [value, setValue] = useState("Gen Z Tools");
  const [size, setSize] = useState(280);
  const [dark, setDark] = useState("#5b21b6");
  const [light, setLight] = useState("#ffffff");
  const [error, setError] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    const draw = async () => {
      try {
        const QR = await import("qrcode");
        if (cancelled) return;
        await QR.toCanvas(canvas, value || " ", {
          width: size,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark, light },
        });
        setError("");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not draw that QR code.");
      }
    };
    void draw();
    return () => {
      cancelled = true;
    };
  }, [value, size, dark, light]);

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="space-y-3">
        <label className="block text-sm font-medium" htmlFor="qr-value">
          Content
        </label>
        <Input
          id="qr-value"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Text or URL"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            Size
            <Input
              className="mt-1"
              type="number"
              min={160}
              max={800}
              value={size}
              onChange={(event) => setSize(clamp(Number(event.target.value) || 280, 160, 800))}
            />
          </label>
          <label className="text-sm">
            Foreground
            <Input className="mt-1 h-10 p-1" type="color" value={dark} onChange={(event) => setDark(event.target.value)} />
          </label>
          <label className="text-sm">
            Background
            <Input className="mt-1 h-10 p-1" type="color" value={light} onChange={(event) => setLight(event.target.value)} />
          </label>
        </div>
        <Button
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.toBlob((blob) => {
              if (!blob) {
                toast.error("Could not export the image.");
                return;
              }
              downloadBlob(blob, "qrcode.png");
            });
          }}
        >
          Download PNG
        </Button>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex justify-center rounded-xl border bg-background p-3">
        <canvas ref={canvasRef} aria-label="QR code preview" className="h-auto max-w-full" />
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
