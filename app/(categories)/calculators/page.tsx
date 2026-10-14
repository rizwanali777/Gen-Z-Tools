import type { Metadata } from "next";
import { CategoryIndex } from "@/components/layout/CategoryIndex";
import { categoryMetadata } from "@/lib/seo";

export const metadata: Metadata = categoryMetadata("calculators");

export default function CalculatorsPage() {
  return <CategoryIndex slug="calculators" />;
}
