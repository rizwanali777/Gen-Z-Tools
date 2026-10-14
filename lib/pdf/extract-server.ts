import { layoutTextItems, type LaidOutPage } from "@/lib/pdf/text-layout";

const PAGE_LIMIT = 150;

type PdfPage = {
  getTextContent: () => Promise<{ items: unknown[] }>;
  cleanup: () => void;
};

type PdfDoc = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
  destroy: () => Promise<void>;
};

type PdfjsLegacy = {
  getDocument: (params: Record<string, unknown>) => { promise: Promise<PdfDoc> };
};

export async function extractPdfOnServer(data: Uint8Array): Promise<LaidOutPage[]> {
  const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as PdfjsLegacy;
  const task = pdfjs.getDocument({
    data,
    verbosity: 0,
    useSystemFonts: true,
    isEvalSupported: false,
    disableWorker: true,
  });
  const doc = await task.promise;
  const total = Math.min(doc.numPages, PAGE_LIMIT);
  const pages: LaidOutPage[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= total; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(layoutTextItems(content.items));
      page.cleanup();
    }
  } finally {
    await doc.destroy();
  }
  return pages;
}
