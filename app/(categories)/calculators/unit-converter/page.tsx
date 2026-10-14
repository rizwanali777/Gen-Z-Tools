import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { UnitConverterTool } from "@/components/tools/UnitConverterTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("unit-converter");

export default function UnitConverterPage() {
  return (
    <ToolLayout slug="unit-converter">
      <UnitConverterTool />
    </ToolLayout>
  );
}
