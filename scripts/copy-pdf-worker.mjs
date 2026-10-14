import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const candidates = [
  "pdfjs-dist/build/pdf.worker.min.mjs",
  "pdfjs-dist/build/pdf.worker.mjs",
];

let source = "";
for (const candidate of candidates) {
  try {
    source = require.resolve(candidate);
    break;
  } catch {
    source = "";
  }
}

if (!source) {
  console.error("Could not find the pdf.js worker in pdfjs-dist.");
  process.exit(1);
}

mkdirSync("public", { recursive: true });
const target = join("public", "pdf.worker.min.mjs");
copyFileSync(source, target);
console.log(`Copied pdf.js worker to ${target}`);
