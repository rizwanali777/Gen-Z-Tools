import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { JsonFormatterTool } from "@/components/tools/JsonFormatterTool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("json-formatter");

export default function JsonFormatterPage() {
  return (
    <ToolLayout slug="json-formatter">
      <JsonFormatterTool />
    </ToolLayout>
  );
}
