import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { CsvToJsonTool } from "@/components/tools/CsvToJsonTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("csv-to-json");

export default function CsvToJsonPage() {
  return (
    <ToolLayout slug="csv-to-json">
      <CsvToJsonTool />
    </ToolLayout>
  );
}
