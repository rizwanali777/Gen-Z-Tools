import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { CaseConverterTool } from "@/components/tools/CaseConverterTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("case-converter");

export default function CaseConverterPage() {
  return (
    <ToolLayout slug="case-converter">
      <CaseConverterTool />
    </ToolLayout>
  );
}
