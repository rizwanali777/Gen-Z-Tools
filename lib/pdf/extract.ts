import { hasExtractedText, layoutTextItems, type LaidOutPage } from "@/lib/pdf/text-layout";

const PAGE_LIMIT = 150;

export async function extractPdfPages(buffer: ArrayBuffer): Promise<LaidOutPage[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const task = pdfjs.getDocument({
    data: new Uint8Array(buffer.slice(0)),
    verbosity: 0,
    useSystemFonts: true,
    isEvalSupported: false,
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

export { hasExtractedText };
