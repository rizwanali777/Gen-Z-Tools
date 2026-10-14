import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { PdfToCsvTool } from "@/components/tools/PdfToCsvTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("pdf-to-csv");

export default function PdfToCsvPage() {
  return (
    <ToolLayout slug="pdf-to-csv">
      <PdfToCsvTool />
    </ToolLayout>
  );
}
