import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { PercentageTool } from "@/components/tools/PercentageTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("percentage-calculator");

export default function PercentagePage() {
  return (
    <ToolLayout slug="percentage-calculator">
      <PercentageTool />
    </ToolLayout>
  );
}
