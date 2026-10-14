import Link from "next/link";
import { getCategory, processingLabel, type ToolDefinition } from "@/config/tools-registry";
import { ToolIcon } from "@/components/shared/ToolIcon";
import { cn } from "@/lib/utils";

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const category = getCategory(tool.category);
  return (
    <Link
      href={tool.href}
      className="glass group flex h-full gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:border-violet-400/50 hover:shadow-[0_12px_32px_rgba(56,189,248,0.16)]"
    >
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", category.tone)}>
        <ToolIcon name={tool.icon} className="size-5" />
      </span>
      <span className="min-w-0">
        <h2 className="truncate text-base font-semibold tracking-tight">{tool.name}</h2>
        <span className="mt-1 block text-sm leading-5 text-muted-foreground">{tool.summary}</span>
        <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {processingLabel(tool.processing)}
        </span>
      </span>
    </Link>
  );
}
