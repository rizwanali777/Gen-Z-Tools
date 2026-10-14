export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array {
  const cleaned = value.replace(/^data:.*?;base64,/i, "").replace(/\s/g, "");
  if (!cleaned) return new Uint8Array();
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned) || cleaned.length % 4 === 1) {
    throw new Error("That string is not valid Base64.");
  }
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function encodeText(value: string): string {
  return bytesToBase64(new TextEncoder().encode(value));
}

export function decodeText(value: string): string {
  return new TextDecoder("utf-8", { fatal: false }).decode(base64ToBytes(value));
}
