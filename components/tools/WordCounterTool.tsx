"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeText } from "@/lib/text";
import { formatMinutes } from "@/lib/format";
import { copyText } from "@/lib/files";

const SAMPLE = "Gen Z Tools counts this sentence locally. Paste a draft, a caption, or a whole article. Nothing is uploaded.";

export function WordCounterTool() {
  const [text, setText] = useState("");
  const stats = useMemo(() => analyzeText(text), [text]);

  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <Stat label="Words" value={stats.words} />
        <Stat label="Characters" value={stats.characters} />
        <Stat label="No spaces" value={stats.charactersNoSpaces} />
        <Stat label="Sentences" value={stats.sentences} />
        <Stat label="Paragraphs" value={stats.paragraphs} />
        <Stat label="Reading" value={formatMinutes(stats.readingMinutes, stats.words)} />
      </dl>
      <p className="sr-only" aria-live="polite">
        {stats.words} words, {stats.characters} characters
      </p>
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type or paste text…"
        aria-label="Text to count"
        className="h-[min(28rem,calc(100dvh-18rem))] resize-none"
      />
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>Speaking time {formatMinutes(stats.speakingMinutes, stats.words)}</span>
        <span className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setText(SAMPLE)}>
            Example
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setText("");
            }}
          >
            Clear
          </Button>
          <Button
            size="sm"
            disabled={!text}
            onClick={() => {
              void copyText(text).then(() => toast.success("Copied"));
            }}
          >
            Copy
          </Button>
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-background px-2 py-1.5">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-mono text-lg leading-tight">{value}</dd>
    </div>
  );
}
