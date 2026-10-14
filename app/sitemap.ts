import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { categories, getAllTools } from "@/config/tools-registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: siteConfig.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...categories.map((category) => ({
      url: `${siteConfig.url}${category.href}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...getAllTools().map((tool) => ({
      url: `${siteConfig.url}${tool.href}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${siteConfig.url}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
