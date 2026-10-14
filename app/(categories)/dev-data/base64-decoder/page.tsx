import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { Base64Tool } from "@/components/tools/Base64Tool";
import { toolMetadata } from "@/lib/seo";

export const metadata: Metadata = toolMetadata("base64-decoder");

export default function Base64Page() {
  return (
    <ToolLayout slug="base64-decoder">
      <Base64Tool />
    </ToolLayout>
  );
}
