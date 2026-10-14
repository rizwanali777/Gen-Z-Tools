export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function stem(name: string): string {
  const trimmed = name.replace(/\.[^.]+$/, "").trim();
  return trimmed || "file";
}

export function safeFilename(name: string, extension: string): string {
  const base = stem(name)
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `${base || "file"}.${extension}`;
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}
