import Link from "next/link";
import { BrandMark } from "@/components/layout/BrandMark";
import { siteConfig } from "@/config/site";
import { categories, getToolsByCategory } from "@/config/tools-registry";

export function Footer() {
  return (
    <footer className="glass mx-4 mb-4 mt-16 rounded-3xl border">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-1">
          <BrandMark />
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Utilities that run in the browser. AI tools send text or a file only after you press the button.
          </p>
        </div>
        {categories.map((category) => (
          <div key={category.slug}>
            <Link href={category.href} className="text-sm font-semibold">
              {category.name}
            </Link>
            <ul className="mt-2 space-y-1">
              {getToolsByCategory(category.slug).map((tool) => (
                <li key={tool.slug}>
                  <Link href={tool.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/40 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteConfig.name}</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
