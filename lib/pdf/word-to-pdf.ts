const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const FONT_SIZE = 11;
const LINE_HEIGHT = 16;

export async function docxToPdfBytes(bytes: ArrayBuffer): Promise<Uint8Array> {
  const paragraphs = await readDocxParagraphs(bytes);
  if (paragraphs.length === 0) {
    throw new Error("This Word file has no readable paragraphs.");
  }

  const { PDFDocument, StandardFonts } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  pdf.setCreator("Gen Z Tools");
  pdf.setProducer("Gen Z Tools");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const maxWidth = PAGE_WIDTH - MARGIN * 2;

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const writeLine = (line: string) => {
    if (y < MARGIN) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
    page.drawText(line, { x: MARGIN, y, size: FONT_SIZE, font });
    y -= LINE_HEIGHT;
  };

  paragraphs.forEach((paragraph, index) => {
    const lines = wrapLine(winAnsiSafe(paragraph), (value) => font.widthOfTextAtSize(value, FONT_SIZE), maxWidth);
    for (const line of lines) writeLine(line);
    if (index < paragraphs.length - 1) y -= LINE_HEIGHT * 0.35;
  });

  return pdf.save();
}

async function readDocxParagraphs(bytes: ArrayBuffer): Promise<string[]> {
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(bytes);
  const xml = await zip.file("word/document.xml")?.async("string");
  if (!xml) throw new Error("Save the file as .docx. Older .doc files cannot be read here.");

  const prepared = xml.replace(/<w:tab\/>/g, " ").replace(/<w:br[^>]*\/>/g, "\n");
  const paragraphs: string[] = [];
  for (const chunk of prepared.split(/<w:p[\s>]/)) {
    const pieces = [...chunk.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)].map((match) => decodeXml(match[1] ?? ""));
    const text = pieces.join("").replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n").trim();
    if (text) paragraphs.push(text);
  }
  return paragraphs;
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&");
}

function winAnsiSafe(input: string): string {
  const mapped = input
    .replace(/\u00a0/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u2022/g, "*");
  let out = "";
  for (const char of mapped) {
    const code = char.codePointAt(0) ?? 0;
    if (code === 10) {
      out += "\n";
      continue;
    }
    if ((code >= 32 && code <= 126) || (code >= 160 && code <= 255)) out += char;
    else out += "?";
  }
  return out;
}

function wrapLine(text: string, widthOf: (value: string) => number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const block of text.split("\n")) {
    const words = block.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (widthOf(next) <= maxWidth) {
        current = next;
        continue;
      }
      if (current) lines.push(current);
      current = breakLongWord(word, widthOf, maxWidth, lines);
    }
    if (current) lines.push(current);
  }
  return lines.length > 0 ? lines : [""];
}

function breakLongWord(word: string, widthOf: (value: string) => number, maxWidth: number, lines: string[]): string {
  if (widthOf(word) <= maxWidth) return word;
  let chunk = "";
  for (const char of word) {
    const trial = chunk + char;
    if (chunk && widthOf(trial) > maxWidth) {
      lines.push(chunk);
      chunk = char;
    } else {
      chunk = trial;
    }
  }
  return chunk;
}
