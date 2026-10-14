export type MergeResult = {
  bytes: Uint8Array;
  pageCount: number;
};

export async function mergePdfFiles(files: File[]): Promise<MergeResult> {
  const { PDFDocument } = await import("pdf-lib");
  const merged = await PDFDocument.create();
  for (const file of files) {
    const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false });
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  merged.setCreator("Gen Z Tools");
  merged.setProducer("Gen Z Tools");
  const bytes = await merged.save();
  return { bytes, pageCount: merged.getPageCount() };
}

export async function countPdfPages(file: File): Promise<number> {
  const { PDFDocument } = await import("pdf-lib");
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false });
  return source.getPageCount();
}
