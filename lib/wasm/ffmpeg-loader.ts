import type { FFmpeg } from "@ffmpeg/ffmpeg";

let ffmpegPromise: Promise<FFmpeg> | null = null;

export async function transcodeWavToMp3(wav: Blob, onStatus?: (message: string) => void): Promise<Blob> {
  onStatus?.("Loading the MP3 encoder…");
  const ffmpeg = await loadFfmpeg();
  const { fetchFile } = await import("@ffmpeg/util");
  onStatus?.("Encoding MP3…");
  const input = await fetchFile(wav);
  await ffmpeg.writeFile("input.wav", input);
  const code = await ffmpeg.exec(["-i", "input.wav", "-codec:a", "libmp3lame", "-b:a", "192k", "output.mp3"]);
  if (code !== 0) {
    throw new Error("MP3 encoding failed.");
  }
  const output = await ffmpeg.readFile("output.mp3");
  await ffmpeg.deleteFile("input.wav");
  await ffmpeg.deleteFile("output.mp3");
  const bytes = typeof output === "string" ? new TextEncoder().encode(output) : output;
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "audio/mpeg" });
}

function loadFfmpeg(): Promise<FFmpeg> {
  if (!ffmpegPromise) {
    ffmpegPromise = createFfmpeg().catch((error: unknown) => {
      ffmpegPromise = null;
      throw error;
    });
  }
  return ffmpegPromise;
}

async function createFfmpeg(): Promise<FFmpeg> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { toBlobURL } = await import("@ffmpeg/util");
  const ffmpeg = new FFmpeg();
  const base = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
  });
  return ffmpeg;
}
