import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { QrGeneratorTool } from "@/components/tools/QrGeneratorTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("qr-code-generator");

export default function QrCodePage() {
  return (
    <ToolLayout slug="qr-code-generator">
      <QrGeneratorTool />
    </ToolLayout>
  );
}
