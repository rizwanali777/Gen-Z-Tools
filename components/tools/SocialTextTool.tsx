"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copyText } from "@/lib/files";
import { textStyles, type TextStyleId } from "@/lib/social-text";

const SAMPLE = "New drop this Friday. Save this post.";

export function SocialTextTool() {
  const [input, setInput] = useState(SAMPLE);
  const [active, setActive] = useState<TextStyleId>("bold");
  const selected = textStyles.find((style) => style.id === active) ?? textStyles[0];
  const output = useMemo(() => selected.apply(input), [input, selected]);

  const copy = (value: string) => {
    if (!value) return;
    void copyText(value).then(() => toast.success("Copied. Paste it into your caption."));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Bold, italic, and the other styles are Unicode letters, so they paste into Instagram, X, TikTok, Facebook, and WhatsApp.
      </p>
      <Textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        aria-label="Caption to style"
        placeholder="Write a caption…"
        className="h-[min(9rem,28dvh)] resize-none font-sans"
      />
      <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Text styles">
        {textStyles.map((style) => (
          <Button
            key={style.id}
            size="sm"
            variant={style.id === active ? "default" : "outline"}
            aria-pressed={style.id === active}
            onClick={() => setActive(style.id)}
          >
            {style.label}
          </Button>
        ))}
      </div>
      <div className="glass-inset rounded-xl border p-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{selected.label}</p>
          <Button size="sm" disabled={!output} onClick={() => copy(output)}>
            Copy
          </Button>
        </div>
        <p className="mt-2 whitespace-pre-wrap break-words text-lg leading-7" aria-live="polite">
          {output || "Your styled caption appears here."}
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {textStyles.map((style) => {
          const preview = input ? style.apply(input) : style.apply("Your caption");
          return (
            <li key={style.id} className="glass-inset flex items-start justify-between gap-3 rounded-xl border p-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{style.label}</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{preview}</p>
              </div>
              <Button size="sm" variant="outline" disabled={!input} onClick={() => copy(style.apply(input))}>
                Copy
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
