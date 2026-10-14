import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getCategory, getTool, type ToolCategorySlug } from "@/config/tools-registry";

export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path}`;
}

export function toolMetadata(slug: string): Metadata {
  const tool = getTool(slug);
  const url = absoluteUrl(tool.href);
  return {
    title: tool.name,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: tool.name,
      description: tool.description,
      url,
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
    },
  };
}

export function categoryMetadata(slug: ToolCategorySlug): Metadata {
  const category = getCategory(slug);
  const url = absoluteUrl(category.href);
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: url },
    openGraph: {
      title: category.name,
      description: category.description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
    },
  };
}
