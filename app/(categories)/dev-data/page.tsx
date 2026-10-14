import type { Metadata } from "next";
import { CategoryIndex } from "@/components/layout/CategoryIndex";
import { categoryMetadata } from "@/lib/seo";

export const metadata: Metadata = categoryMetadata("dev-data");

export default function DevDataPage() {
  return <CategoryIndex slug="dev-data" />;
}
