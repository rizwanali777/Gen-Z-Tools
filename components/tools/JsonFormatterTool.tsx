"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copyText, downloadBlob } from "@/lib/files";

type JsonError = {
  message: string;
  line?: number;
  column?: number;
};

export function JsonFormatterTool() {
  const [text, setText] = useState('{\n  "tool": "Gen Z Tools",\n  "local": true\n}');
  const [error, setError] = useState<JsonError | null>(null);
  const [checked, setChecked] = useState(false);

  const bytes = useMemo(() => new TextEncoder().encode(text).length, [text]);

  const run = (space: number | undefined) => {
    try {
      const parsed: unknown = JSON.parse(text);
      setText(JSON.stringify(parsed, null, space));
      setError(null);
      setChecked(true);
    } catch (cause) {
      setError(describe(cause, text));
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setError(null);
          setChecked(false);
        }}
        spellCheck={false}
        aria-label="JSON"
        className="h-[min(28rem,calc(100dvh-18rem))] resize-none"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => run(2)}>Format</Button>
        <Button variant="outline" onClick={() => run(undefined)}>
          Minify
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            void copyText(text).then(() => toast.success("Copied"));
          }}
        >
          Copy
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            const blob = new Blob([text], { type: "application/json" });
            downloadBlob(blob, "data.json");
          }}
        >
          Download
        </Button>
        <span className="ml-auto font-mono text-xs text-muted-foreground">{bytes} bytes</span>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
          {error.line ? ` (line ${error.line}, column ${error.column ?? 1})` : ""}
        </p>
      ) : checked ? (
        <p className="text-sm text-muted-foreground">This JSON is valid.</p>
      ) : (
        <p className="text-sm text-muted-foreground">Format or minify to validate.</p>
      )}
    </div>
  );
}

function describe(cause: unknown, source: string): JsonError {
  const message = cause instanceof Error ? cause.message : "Invalid JSON";
  const match = /position\s+(\d+)/i.exec(message);
  if (!match?.[1]) return { message };
  const position = Number(match[1]);
  const upto = source.slice(0, position);
  const line = upto.split("\n").length;
  const column = position - upto.lastIndexOf("\n");
  return { message, line, column };
}
