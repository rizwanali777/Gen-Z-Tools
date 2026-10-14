import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { SocialTextTool } from "@/components/tools/SocialTextTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("social-text");

export default function SocialTextPage() {
  return (
    <ToolLayout slug="social-text">
      <SocialTextTool />
    </ToolLayout>
  );
}
