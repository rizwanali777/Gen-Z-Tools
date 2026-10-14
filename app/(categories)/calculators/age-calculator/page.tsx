import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { AgeCalculatorTool } from "@/components/tools/AgeCalculatorTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("age-calculator");

export default function AgeCalculatorPage() {
  return (
    <ToolLayout slug="age-calculator">
      <AgeCalculatorTool />
    </ToolLayout>
  );
}
