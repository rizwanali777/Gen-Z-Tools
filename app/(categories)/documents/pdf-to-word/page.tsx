import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { PdfToWordTool } from "@/components/tools/PdfToWordTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("pdf-to-word");

export default function PdfToWordPage() {
  return (
    <ToolLayout slug="pdf-to-word">
      <PdfToWordTool />
    </ToolLayout>
  );
}
