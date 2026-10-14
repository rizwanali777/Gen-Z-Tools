import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { AudioCutterTool } from "@/components/tools/AudioCutterTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("audio-cutter");

export default function AudioCutterPage() {
  return (
    <ToolLayout slug="audio-cutter">
      <AudioCutterTool />
    </ToolLayout>
  );
}
