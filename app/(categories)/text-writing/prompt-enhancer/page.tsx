import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { PromptEnhancerTool } from "@/components/tools/PromptEnhancerTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("prompt-enhancer");

export default function PromptEnhancerPage() {
  return (
    <ToolLayout slug="prompt-enhancer">
      <PromptEnhancerTool />
    </ToolLayout>
  );
}
