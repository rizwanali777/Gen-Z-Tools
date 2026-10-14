import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import type { LaidOutPage } from "@/lib/pdf/text-layout";

const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function pagesToDocxBytes(pages: LaidOutPage[], title: string): Promise<Uint8Array> {
  const children: Paragraph[] = [];
  pages.forEach((page, index) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: `Page ${index + 1}`, bold: true })],
      }),
    );
    const lines = page.lines.filter((line) => line.trim().length > 0);
    const content = lines.length > 0 ? lines : [" "];
    for (const line of content) {
      children.push(new Paragraph({ children: [new TextRun(line)] }));
    }
  });

  const doc = new Document({
    creator: "Gen Z Tools",
    title,
    description: "Text extracted from a PDF.",
    sections: [{ children }],
  });
  const buffer = await Packer.toBuffer(doc);
  return new Uint8Array(buffer);
}

export function docxBlob(bytes: Uint8Array): Blob {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: DOCX_TYPE });
}

export { DOCX_TYPE };
