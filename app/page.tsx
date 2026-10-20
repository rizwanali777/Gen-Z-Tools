import type { Metadata } from "next";
import { HomeExplorer } from "@/components/home/HomeExplorer";
import { categories } from "@/config/tools-registry";
import { siteConfig, siteTitle } from "@/config/site";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    absolute: siteTitle,
  },
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
};

export default function HomePage() {
  return (
    <>
      <HomeExplorer />
      <section className="mx-auto w-full max-w-6xl px-4 pb-8">
        <div className="mt-8 grid gap-6 border-t pt-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-lg font-semibold">Built for the tab you already have open</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              PDF and Word conversion, image export, JSON formatting, unit math, and QR codes run with JavaScript and the canvas.
              Heavy pieces such as the PDF reader, the MP3 encoder, and background removal load only after you use them.
              Background removal stays on this device. Grammar correction, email drafts, and prompt expansion call a server
              proxy when you press the button, and that proxy is the only place the Hugging Face token lives.
            </p>
          </div>
          <ul className="grid gap-2 text-sm">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={category.href} className="font-medium hover:text-primary">
                  {category.name}
                </Link>
                <span className="text-muted-foreground"> — {category.summary}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
