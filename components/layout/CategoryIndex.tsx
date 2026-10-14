import { getCategory, getToolsByCategory, type ToolCategorySlug } from "@/config/tools-registry";
import { ToolCard } from "@/components/shared/ToolCard";

export function CategoryIndex({ slug }: { slug: ToolCategorySlug }) {
  const category = getCategory(slug);
  const items = getToolsByCategory(slug);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <header className="mb-4">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Category</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{category.name}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{category.summary}</p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((tool) => (
          <li key={tool.slug}>
            <ToolCard tool={tool} />
          </li>
        ))}
      </ul>
      <p className="mt-8 max-w-3xl text-sm leading-6 text-muted-foreground">{category.description}</p>
    </div>
  );
}
