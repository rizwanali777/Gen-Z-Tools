import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { EmailGeneratorTool } from "@/components/tools/EmailGeneratorTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("email-generator");

export default function EmailGeneratorPage() {
  return (
    <ToolLayout slug="email-generator">
      <EmailGeneratorTool />
    </ToolLayout>
  );
}
