import type { ReactNode } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getCategory, getTool, getToolsByCategory } from "@/config/tools-registry";
import { RecentTracker } from "@/components/layout/RecentTracker";
import { ToolCard } from "@/components/shared/ToolCard";
import { TrustBadge } from "@/components/shared/TrustBadge";
import { absoluteUrl } from "@/lib/seo";

export function ToolLayout({ slug, children }: { slug: string; children: ReactNode }) {
  const tool = getTool(slug);
  const category = getCategory(tool.category);
  const related = getToolsByCategory(tool.category)
    .filter((item) => item.slug !== tool.slug)
    .slice(0, 3);
  const url = absoluteUrl(tool.href);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: tool.name,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: tool.description,
        url,
        provider: { "@type": "Organization", name: siteConfig.name },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: category.name, item: absoluteUrl(category.href) },
          { "@type": "ListItem", position: 3, name: tool.name, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: tool.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };

  return (
    <article className="mx-auto w-full max-w-5xl px-4 py-4">
      <RecentTracker slug={tool.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="mb-1 text-xs text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={category.href} className="hover:text-foreground">
                  {category.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground">{tool.name}</li>
            </ol>
          </nav>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.7rem]">{tool.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{tool.summary}</p>
        </div>
        <TrustBadge mode={tool.processing} />
      </header>
      <div className="glass rounded-2xl border p-4 sm:p-5">{children}</div>
      <section className="mt-10 grid gap-8 border-t pt-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">How to use it</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            {tool.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{tool.description}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Questions</h2>
          <dl className="mt-3 space-y-4">
            {tool.faqs.map((faq) => (
              <div key={faq.q}>
                <dt className="text-sm font-medium">{faq.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted-foreground">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      {related.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">More in {category.name}</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <ToolCard tool={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
