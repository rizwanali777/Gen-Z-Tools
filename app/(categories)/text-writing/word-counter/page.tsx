import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { WordCounterTool } from "@/components/tools/WordCounterTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("word-counter");

export default function WordCounterPage() {
  return (
    <ToolLayout slug="word-counter">
      <WordCounterTool />
    </ToolLayout>
  );
}
