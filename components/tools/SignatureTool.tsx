"use client";

import { Caveat, Great_Vibes } from "next/font/google";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadBlob } from "@/lib/files";
import { cn } from "@/lib/utils";

const caveat = Caveat({ subsets: ["latin"], weight: "500" });
const vibes = Great_Vibes({ subsets: ["latin"], weight: "400" });

type Point = { x: number; y: number };
type Stroke = { color: string; size: number; points: Point[] };
type Mode = "draw" | "type";

const WIDTH = 1800;
const HEIGHT = 560;

export function SignatureTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const activeRef = useRef<Stroke | null>(null);
  const [mode, setMode] = useState<Mode>("draw");
  const [color, setColor] = useState("#111111");
  const [size, setSize] = useState(8);
  const [name, setName] = useState("Avery Cole");
  const [font, setFont] = useState<"caveat" | "vibes" | "cursive">("caveat");
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    drawStrokes(canvasRef.current, strokesRef.current);
  }, [mode]);

  const families = {
    caveat: caveat.style.fontFamily,
    vibes: vibes.style.fontFamily,
    cursive: "Segoe Script, Brush Script MT, cursive",
  };

  const pointerPoint = (event: PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    };
  };

  const exportCanvas = async () => {
    if (mode === "draw") {
      const source = canvasRef.current;
      if (!source || strokesRef.current.length === 0) return;
      source.toBlob((blob) => {
        if (blob) downloadBlob(blob, "signature.png");
      });
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) return;
    const family = families[font];
    await document.fonts.load(`160px ${family}`);
    const canvas = document.createElement("canvas");
    canvas.width = 2400;
    canvas.height = 700;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `160px ${family}`;
    ctx.fillText(trimmed, canvas.width / 2, canvas.height / 2);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, "signature.png");
    });
  };

  return (
    <div className="space-y-3">
      <p className={`${caveat.className} ${vibes.className} sr-only`} aria-hidden>
        Signature fonts
      </p>
      <div className="flex flex-wrap gap-2">
        <Chip active={mode === "draw"} onClick={() => setMode("draw")}>
          Draw
        </Chip>
        <Chip active={mode === "type"} onClick={() => setMode("type")}>
          Type
        </Chip>
      </div>
      {mode === "draw" ? (
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          aria-label="Signature pad"
          className="h-44 w-full touch-none rounded-xl border bg-[linear-gradient(transparent,transparent)]"
          style={{ backgroundColor: "rgba(255,255,255,0.35)" }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            const stroke: Stroke = { color, size: size * 3, points: [pointerPoint(event)] };
            activeRef.current = stroke;
            strokesRef.current = [...strokesRef.current, stroke];
            setHasInk(true);
            drawStrokes(event.currentTarget, strokesRef.current);
          }}
          onPointerMove={(event) => {
            if (!activeRef.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
            activeRef.current.points.push(pointerPoint(event));
            drawStrokes(event.currentTarget, strokesRef.current);
          }}
          onPointerUp={() => {
            activeRef.current = null;
          }}
        />
      ) : (
        <div className="flex h-44 items-center justify-center rounded-xl border bg-white/40 px-4 dark:bg-black/30">
          <p
            className={cn("text-center text-5xl text-black sm:text-6xl", font === "vibes" ? vibes.className : font === "caveat" ? caveat.className : "")}
            style={{ color, fontFamily: font === "cursive" ? families.cursive : undefined }}
          >
            {name.trim() || "Your name"}
          </p>
        </div>
      )}
      <div className="flex flex-wrap items-end gap-3">
        {mode === "type" ? (
          <>
            <label className="min-w-48 flex-1 text-sm">
              Name
              <Input className="mt-1" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <div className="flex gap-2">
              <Chip active={font === "caveat"} onClick={() => setFont("caveat")}>
                Casual
              </Chip>
              <Chip active={font === "vibes"} onClick={() => setFont("vibes")}>
                Formal
              </Chip>
              <Chip active={font === "cursive"} onClick={() => setFont("cursive")}>
                Script
              </Chip>
            </div>
          </>
        ) : (
          <label className="text-sm">
            Pen {size}px
            <input
              className="mt-2 block w-36"
              type="range"
              min={2}
              max={16}
              value={size}
              onChange={(event) => setSize(Number(event.target.value))}
            />
          </label>
        )}
        <label className="text-sm">
          Ink
          <Input className="mt-1 h-10 w-16 p-1" type="color" value={color} onChange={(event) => setColor(event.target.value)} />
        </label>
        <Button onClick={() => void exportCanvas()} disabled={mode === "draw" ? !hasInk : name.trim().length === 0}>
          Download PNG
        </Button>
        {mode === "draw" ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                strokesRef.current = strokesRef.current.slice(0, -1);
                setHasInk(strokesRef.current.length > 0);
                drawStrokes(canvasRef.current, strokesRef.current);
              }}
            >
              Undo
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                strokesRef.current = [];
                setHasInk(false);
                drawStrokes(canvasRef.current, []);
              }}
            >
              Clear
            </Button>
          </>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">The PNG is transparent and saved at high resolution. Nothing is uploaded.</p>
    </div>
  );
}

function drawStrokes(canvas: HTMLCanvasElement | null, strokes: Stroke[]) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const stroke of strokes) {
    const first = stroke.points[0];
    if (!first) continue;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (const point of stroke.points.slice(1)) ctx.lineTo(point.x, point.y);
    if (stroke.points.length === 1) ctx.lineTo(first.x + 0.01, first.y);
    ctx.stroke();
  }
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm",
        active ? "border-transparent bg-gradient-to-r from-violet-600 to-sky-500 text-white" : "glass-inset",
      )}
    >
      {children}
    </button>
  );
}
