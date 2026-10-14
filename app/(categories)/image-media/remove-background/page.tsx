import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { RemoveBgTool } from "@/components/tools/RemoveBgTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("remove-background");

export default function RemoveBackgroundPage() {
  return (
    <ToolLayout slug="remove-background">
      <RemoveBgTool />
    </ToolLayout>
  );
}
