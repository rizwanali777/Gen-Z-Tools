import type { Metadata } from "next";
import { CategoryIndex } from "@/components/layout/CategoryIndex";
import { categoryMetadata } from "@/lib/seo";

export const metadata: Metadata = categoryMetadata("text-writing");

export default function TextWritingPage() {
  return <CategoryIndex slug="text-writing" />;
}
