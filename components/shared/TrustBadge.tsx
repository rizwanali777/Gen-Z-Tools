import { ShieldCheck, Sparkles } from "lucide-react";
import type { ProcessingMode } from "@/config/tools-registry";
import { cn } from "@/lib/utils";

const copy: Record<ProcessingMode, { label: string; detail: string }> = {
  client: {
    label: "100% on your device",
    detail: "This tool never uploads your files.",
  },
  ai: {
    label: "Sent only when you run it",
    detail: "Nothing is uploaded until you press the action button.",
  },
  hybrid: {
    label: "Local first",
    detail: "The default path stays in your browser. The server runs only if you ask.",
  },
};

export function TrustBadge({ mode, className }: { mode: ProcessingMode; className?: string }) {
  const item = copy[mode];
  const Icon = mode === "ai" ? Sparkles : ShieldCheck;
  return (
    <p
      className={cn(
        "glass-inset inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-foreground",
        className,
      )}
      title={item.detail}
    >
      <Icon className="size-3.5 text-primary" aria-hidden />
      {item.label}
    </p>
  );
}
