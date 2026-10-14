import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { GrammarTool } from "@/components/tools/GrammarTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("ai-grammar-fixer");

export default function GrammarPage() {
  return (
    <ToolLayout slug="ai-grammar-fixer">
      <GrammarTool />
    </ToolLayout>
  );
}
