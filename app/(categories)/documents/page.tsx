import type { Metadata } from "next";
import { CategoryIndex } from "@/components/layout/CategoryIndex";
import { categoryMetadata } from "@/lib/seo";

export const metadata: Metadata = categoryMetadata("documents");

export default function DocumentsPage() {
  return <CategoryIndex slug="documents" />;
}
