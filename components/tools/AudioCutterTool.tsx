"use client";

import { useEffect, useRef, useState } from "react";
import { Dropzone } from "@/components/shared/Dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { audioBufferToWav, decodeAudioFile, sliceAudioBuffer } from "@/lib/audio/wav";
import { downloadBlob, safeFilename, stem } from "@/lib/files";
import { formatClock } from "@/lib/format";

export function AudioCutterTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const playRef = useRef<AudioBufferSourceNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const [fileName, setFileName] = useState("");
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    return () => {
      playRef.current?.stop();
      void contextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const buffer = bufferRef.current;
    if (!canvas || !buffer) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    const data = buffer.getChannelData(0);
    const step = Math.max(1, Math.floor(data.length / width));
    const dark = document.documentElement.classList.contains("dark");
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = dark ? "#05040a" : "#ffffff";
    ctx.fillRect(0, 0, width, height);
    const startX = duration ? (start / duration) * width : 0;
    const endX = duration ? (end / duration) * width : width;
    ctx.fillStyle = dark ? "rgba(56, 189, 248, 0.28)" : "rgba(124, 58, 237, 0.16)";
    ctx.fillRect(startX, 0, Math.max(1, endX - startX), height);
    ctx.beginPath();
    ctx.strokeStyle = dark ? "#38bdf8" : "#7c3aed";
    for (let x = 0; x < width; x += 1) {
      let min = 1;
      let max = -1;
      const offset = x * step;
      for (let i = 0; i < step; i += 1) {
        const sample = data[offset + i] ?? 0;
        if (sample < min) min = sample;
        if (sample > max) max = sample;
      }
      const y1 = ((1 - max) * height) / 2;
      const y2 = ((1 - min) * height) / 2;
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
    }
    ctx.stroke();
  }, [duration, start, end, fileName]);

  const open = async (file: File) => {
    setError("");
    setStatus("Decoding audio…");
    try {
      const buffer = await decodeAudioFile(file);
      bufferRef.current = buffer;
      setFileName(file.name);
      setDuration(buffer.duration);
      setStart(0);
      setEnd(buffer.duration);
      setStatus("");
    } catch {
      setStatus("");
      setError("This browser could not decode that audio file.");
    }
  };

  const play = async () => {
    const buffer = bufferRef.current;
    if (!buffer) return;
    playRef.current?.stop();
    const context = contextRef.current ?? new AudioContext();
    contextRef.current = context;
    if (context.state === "suspended") await context.resume();
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0, start, Math.max(0.05, end - start));
    playRef.current = source;
  };

  const downloadWav = () => {
    const buffer = bufferRef.current;
    if (!buffer || end <= start) {
      setError("Choose a selection longer than zero.");
      return;
    }
    const sliced = sliceAudioBuffer(buffer, start, end);
    downloadBlob(audioBufferToWav(sliced), safeFilename(stem(fileName), "wav"));
    setStatus("Downloaded WAV.");
  };

  const downloadMp3 = async () => {
    const buffer = bufferRef.current;
    if (!buffer || end <= start) {
      setError("Choose a selection longer than zero.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const wav = audioBufferToWav(sliceAudioBuffer(buffer, start, end));
      const { transcodeWavToMp3 } = await import("@/lib/wasm/ffmpeg-loader");
      const mp3 = await transcodeWavToMp3(wav, setStatus);
      downloadBlob(mp3, safeFilename(stem(fileName), "mp3"));
      setStatus("Downloaded MP3.");
    } catch (cause) {
      setStatus("");
      setError(cause instanceof Error ? cause.message : "MP3 export failed. WAV still works offline.");
    } finally {
      setPending(false);
    }
  };

  const seek = (clientX: number, rect: DOMRect, mode: "start" | "end" | "range") => {
    if (!duration) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const time = ratio * duration;
    if (mode === "start") setStart(Math.min(time, end - 0.05));
    else setEnd(Math.max(time, start + 0.05));
  };

  if (!fileName) {
    return (
      <div className="space-y-3">
        <Dropzone
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.webm"
          title="Drop audio to trim"
          detail="WAV export is instant. MP3 loads an encoder only if you ask."
          onFiles={(files) => {
            const file = files[0];
            if (file) void open(file);
          }}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="truncate font-medium">{fileName}</p>
        <p className="font-mono text-muted-foreground">{formatClock(duration)}</p>
      </div>
      <canvas
        ref={canvasRef}
        width={880}
        height={140}
        className="h-28 w-full rounded-xl border"
        aria-label="Waveform"
        onPointerDown={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          const nearerStart = Math.abs(ratio * duration - start) < Math.abs(ratio * duration - end);
          const mode = nearerStart ? "start" : "end";
          seek(event.clientX, rect, mode);
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.dataset.mode = mode;
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          const mode = event.currentTarget.dataset.mode === "start" ? "start" : "end";
          seek(event.clientX, event.currentTarget.getBoundingClientRect(), mode);
        }}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Start {formatClock(start)}
          <input
            className="mt-2 w-full"
            type="range"
            min={0}
            max={duration}
            step={0.01}
            value={start}
            onChange={(event) => setStart(Math.min(Number(event.target.value), end - 0.01))}
          />
        </label>
        <label className="text-sm">
          End {formatClock(end)}
          <input
            className="mt-2 w-full"
            type="range"
            min={0}
            max={duration}
            step={0.01}
            value={end}
            onChange={(event) => setEnd(Math.max(Number(event.target.value), start + 0.01))}
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Start seconds
          <Input className="mt-1" type="number" min={0} step={0.01} value={start.toFixed(2)} onChange={(event) => setStart(Number(event.target.value))} />
        </label>
        <label className="text-sm">
          End seconds
          <Input className="mt-1" type="number" min={0} step={0.01} value={end.toFixed(2)} onChange={(event) => setEnd(Number(event.target.value))} />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => void play()}>
          Preview
        </Button>
        <Button onClick={downloadWav}>Download WAV</Button>
        <Button variant="secondary" onClick={() => void downloadMp3()} disabled={pending}>
          {pending ? "Encoding…" : "Export MP3"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            bufferRef.current = null;
            setFileName("");
            setStatus("");
            setError("");
          }}
        >
          Replace
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Selection {formatClock(Math.max(0, end - start))}. MP3 export downloads ffmpeg.wasm the first time you use it.
      </p>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
