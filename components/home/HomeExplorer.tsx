"use client";

import { Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { categories, getAllTools, searchTools, type ToolCategorySlug } from "@/config/tools-registry";
import { ToolCard } from "@/components/shared/ToolCard";
import { cn } from "@/lib/utils";

export function HomeExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategorySlug | "all">("all");
  const total = getAllTools().length;

  const visible = useMemo(() => {
    const matched = searchTools(query);
    if (category === "all") return matched;
    return matched.filter((tool) => tool.category === category);
  }, [query, category]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-4 pt-5">
      <section className="mb-4">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-violet-700 dark:text-violet-200">
          {siteConfig.name}
        </p>
        <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Sleek tools. Your files stay here.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Convert PDF and Word, resize images, format data, and convert units in the browser. No account. AI text and images
          leave this device only after you press the button.
        </p>
        <label htmlFor="tool-search" className="sr-only">
          Search tools
        </label>
        <div className="relative mt-4 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="tool-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${total} tools`}
            className="glass h-11 w-full rounded-xl border pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="toolbar" aria-label="Filter by category">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
            All
          </FilterChip>
          {categories.map((item) => (
            <FilterChip key={item.slug} active={category === item.slug} onClick={() => setCategory(item.slug)}>
              {item.name}
            </FilterChip>
          ))}
        </div>
      </section>
      {visible.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((tool) => (
            <li key={tool.slug}>
              <ToolCard tool={tool} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="glass rounded-2xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">No tools match “{query}”.</p>
          <button
            type="button"
            className="mt-3 text-sm font-medium text-primary"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm",
        active ? "border-transparent bg-gradient-to-r from-violet-600 to-sky-500 text-white" : "glass text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
