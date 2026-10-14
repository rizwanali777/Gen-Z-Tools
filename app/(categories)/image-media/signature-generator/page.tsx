import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { SignatureTool } from "@/components/tools/SignatureTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("signature-generator");

export default function SignaturePage() {
  return (
    <ToolLayout slug="signature-generator">
      <SignatureTool />
    </ToolLayout>
  );
}
