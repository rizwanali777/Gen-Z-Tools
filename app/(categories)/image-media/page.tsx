import type { Metadata } from "next";
import { CategoryIndex } from "@/components/layout/CategoryIndex";
import { categoryMetadata } from "@/lib/seo";

export const metadata: Metadata = categoryMetadata("image-media");

export default function ImageMediaPage() {
  return <CategoryIndex slug="image-media" />;
}
