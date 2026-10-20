/**
 * Browser-only background removal via @imgly/background-removal.
 * The library chunk and its model assets load on the first removal, not at page load.
 * Model id, public path, and fetch cache follow the package configuration:
 * https://github.com/imgly/background-removal-js
 */

export const IMGLY_PACKAGE = "@imgly/background-removal";
export const IMGLY_VERSION = "1.7.0";
export const IMGLY_SOURCE = "https://github.com/imgly/background-removal-js";
export const IMGLY_LICENSE = "https://github.com/imgly/background-removal-js/blob/main/LICENSE.md";
export const SITE_SOURCE = "https://github.com/rizwanali777/Gen-Z-Tools";
export const ISNET_SOURCE = "https://github.com/xuebinqin/DIS";
export const ONNX_SOURCE = "https://github.com/microsoft/onnxruntime";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGE_EDGE = 4096;
export const MAX_IMAGE_PIXELS = 16_000_000;

const SIMD_PROBE = new Uint8Array([
  0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
]);

type ProgressListener = (key: string, current: number, total: number) => void;

const progressListeners = new Set<ProgressListener>();

function publishProgress(key: string, current: number, total: number) {
  for (const listener of progressListeners) {
    listener(key, current, total);
  }
}

/** The installed package memoizes the first progress callback, so listeners fan out from one stable function. */
export function subscribeRemovalProgress(listener: ProgressListener) {
  progressListeners.add(listener);
  return () => {
    progressListeners.delete(listener);
  };
}

const removalConfig = {
  publicPath: "https://staticimgly.com/@imgly/background-removal-data/${PACKAGE_VERSION}/dist/",
  model: "isnet_fp16",
  device: "cpu",
  rescale: true,
  proxyToWorker: false,
  debug: false,
  fetchArgs: {
    cache: "force-cache",
    mode: "cors",
  },
  output: {
    format: "image/png",
    quality: 0.8,
  },
  progress: publishProgress,
} as const;

export function backgroundRemovalSupport(): string | null {
  if (typeof WebAssembly === "undefined" || typeof WebAssembly.validate !== "function") {
    return "This browser cannot run the background model because WebAssembly is unavailable. Use a current version of Chrome, Edge, Firefox, or Safari.";
  }
  if (!WebAssembly.validate(SIMD_PROBE)) {
    return "This browser does not support WebAssembly SIMD, which the background model needs. Use a current version of Chrome, Edge, Firefox, or Safari.";
  }
  if (typeof createImageBitmap !== "function") {
    return "This browser cannot decode images for the background model. Use a current version of Chrome, Edge, Firefox, or Safari.";
  }
  if (typeof SharedArrayBuffer !== "function" || !crossOriginIsolated) {
    return "This page cannot start the multithreaded model runtime. Reload the background removal page and try again in Chrome, Edge, Firefox, or Safari.";
  }
  return null;
}

export function acceptedImage(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === "image/jpeg" || type === "image/jpg" || type === "image/png" || type === "image/webp") return true;
  if (type) return false;
  return /\.(jpe?g|png|webp)$/i.test(file.name);
}

export async function assertImageLimits(file: File): Promise<{ width: number; height: number }> {
  if (!acceptedImage(file)) {
    throw new Error("Use a JPG, PNG, or WebP image.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Images must be 8 MB or smaller.");
  }
  const header = new Uint8Array(await file.arrayBuffer());
  const declared = dimensionsFromHeader(header);
  if (!declared || declared.width < 2 || declared.height < 2) {
    throw new Error("This image could not be read. Use a standard JPG, PNG, or WebP.");
  }
  assertDimensions(declared.width, declared.height);
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    throw new Error("This image could not be decoded. Use a standard JPG, PNG, or WebP.");
  }
  const width = bitmap.width;
  const height = bitmap.height;
  bitmap.close();
  assertDimensions(width, height);
  return { width, height };
}

function assertDimensions(width: number, height: number) {
  if (width > MAX_IMAGE_EDGE || height > MAX_IMAGE_EDGE || width * height > MAX_IMAGE_PIXELS) {
    throw new Error("Images must be 4,096 pixels or smaller on each side, and no more than 16 megapixels.");
  }
}

let libraryPromise: Promise<typeof import("@imgly/background-removal").removeBackground> | null = null;

function loadRemoveBackground() {
  if (!libraryPromise) {
    libraryPromise = import("@imgly/background-removal")
      .then((mod) => mod.removeBackground)
      .catch((error: unknown) => {
        libraryPromise = null;
        throw error;
      });
  }
  return libraryPromise;
}

export async function removeImageBackground(file: Blob): Promise<Blob> {
  const support = backgroundRemovalSupport();
  if (support) throw new Error(support);
  const removeBackground = await loadRemoveBackground();
  const result = await removeBackground(file, removalConfig);
  if (!(result instanceof Blob) || result.size === 0) {
    throw new Error("The model did not return an image.");
  }
  return result;
}

export function friendlyRemovalError(cause: unknown): string {
  const message = cause instanceof Error ? cause.message : "";
  const lower = message.toLowerCase();
  if (
    lower.includes("sharedarraybuffer") ||
    lower.includes("cross-origin") ||
    lower.includes("not isolated") ||
    lower.includes("multithreaded")
  ) {
    return "This browser blocked the model runtime. Reload the page and try again in Chrome, Edge, Firefox, or Safari.";
  }
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("resource") ||
    lower.includes("publicpath") ||
    lower.includes("download")
  ) {
    return "The model files could not be downloaded. Check your connection, reload the page, and try again.";
  }
  if (
    lower.includes("wasm") ||
    lower.includes("webassembly") ||
    lower.includes("simd") ||
    lower.includes("backend") ||
    lower.includes("session")
  ) {
    return "This browser could not start the background model. Reload the page and use a current version of Chrome, Edge, Firefox, or Safari.";
  }
  if (message && message.length < 240 && !message.includes("\n")) return message;
  return "Background removal failed. Try a smaller JPG, PNG, or WebP.";
}

export function removalProgressLabel(key: string): string {
  if (key.startsWith("fetch:")) {
    if (key.includes("onnxruntime")) return "Downloading the runtime";
    if (key.includes("model")) return "Downloading the model";
    return "Downloading model files";
  }
  if (key === "compute:decode") return "Reading the image";
  if (key === "compute:inference") return "Removing the background";
  if (key === "compute:mask") return "Applying the cutout";
  if (key === "compute:encode") return "Encoding the PNG";
  return "Working";
}

function dimensionsFromHeader(bytes: Uint8Array): { width: number; height: number } | null {
  return pngSize(bytes) ?? jpegSize(bytes) ?? webpSize(bytes);
}

function pngSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 24) return null;
  const png = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let index = 0; index < png.length; index += 1) {
    if (bytes[index] !== png[index]) return null;
  }
  if (textAt(bytes, 12, "IHDR") === false) return null;
  const width = readU32BE(bytes, 16);
  const height = readU32BE(bytes, 20);
  if (!width || !height) return null;
  return { width, height };
}

function jpegSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0xd8 || marker === 0xd9) return null;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2 || offset + 2 + length > bytes.length) return null;
    const sof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (sof) {
      const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
      const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
      if (!width || !height) return null;
      return { width, height };
    }
    offset += 2 + length;
  }
  return null;
}

function webpSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 30 || textAt(bytes, 0, "RIFF") === false || textAt(bytes, 8, "WEBP") === false) return null;
  const chunk = textAt(bytes, 12, "VP8X") ? "VP8X" : textAt(bytes, 12, "VP8 ") ? "VP8 " : textAt(bytes, 12, "VP8L") ? "VP8L" : "";
  if (chunk === "VP8X") {
    const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
    const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    return positive(width, height);
  }
  if (chunk === "VP8 ") {
    const start = 23;
    if (bytes[start] !== 0x9d || bytes[start + 1] !== 0x01 || bytes[start + 2] !== 0x2a) return null;
    const width = (bytes[start + 3] | (bytes[start + 4] << 8)) & 0x3fff;
    const height = (bytes[start + 5] | (bytes[start + 6] << 8)) & 0x3fff;
    return positive(width, height);
  }
  if (chunk === "VP8L") {
    if (bytes[20] !== 0x2f) return null;
    const bits = bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);
    return positive((bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1);
  }
  return null;
}

function positive(width: number, height: number) {
  if (!width || !height) return null;
  return { width, height };
}

function readU32BE(bytes: Uint8Array, offset: number) {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function textAt(bytes: Uint8Array, offset: number, value: string) {
  if (offset + value.length > bytes.length) return false;
  for (let index = 0; index < value.length; index += 1) {
    if (bytes[offset + index] !== value.charCodeAt(index)) return false;
  }
  return true;
}
