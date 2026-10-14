export const siteConfig = {
  name: "Gen Z Tools",
  tagline: "Sleek tools in your browser",
  description:
    "Private browser tools for documents, images, text, data, and everyday calculations. Files stay on your device unless you explicitly run an AI action.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000",
  locale: "en_US",
};

export const siteTitle = `${siteConfig.name} — ${siteConfig.tagline}`;
