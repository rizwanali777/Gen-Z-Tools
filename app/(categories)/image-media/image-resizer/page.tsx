import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { ImageResizerTool } from "@/components/tools/ImageResizerTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("image-resizer");

export default function ImageResizerPage() {
  return (
    <ToolLayout slug="image-resizer">
      <ImageResizerTool />
    </ToolLayout>
  );
}
