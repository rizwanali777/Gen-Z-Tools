"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copyText } from "@/lib/files";

const LIMIT = 4000;

export function GrammarTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const fix = async () => {
    const text = input.trim();
    if (!text) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/ai/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const payload = (await response.json()) as { text?: string; error?: string };
      if (!response.ok || !payload.text) {
        throw new Error(payload.error || "Grammar fix failed.");
      }
      setOutput(payload.text);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Grammar fix failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        The draft stays in this tab until you press Fix grammar. That action sends it through the server proxy.
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        <Textarea
          value={input}
          maxLength={LIMIT}
          onChange={(event) => setInput(event.target.value)}
          aria-label="Text to correct"
          placeholder="Paste a sentence that needs a grammar pass…"
          className="h-[min(22rem,calc(100dvh-20rem))] resize-none font-sans"
        />
        <Textarea
          readOnly
          value={output}
          aria-label="Corrected text"
          placeholder="The correction appears here."
          className="h-[min(22rem,calc(100dvh-20rem))] resize-none font-sans"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => void fix()} disabled={pending || input.trim().length === 0}>
          {pending ? "Fixing…" : "Fix grammar"}
        </Button>
        <Button variant="outline" disabled={!output} onClick={() => setInput(output)}>
          Use correction
        </Button>
        <Button
          variant="outline"
          disabled={!output}
          onClick={() => {
            void copyText(output).then(() => toast.success("Copied"));
          }}
        >
          Copy
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          {input.length}/{LIMIT}
        </span>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
