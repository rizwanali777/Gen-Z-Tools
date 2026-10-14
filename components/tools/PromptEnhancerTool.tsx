"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copyText } from "@/lib/files";
import { cn } from "@/lib/utils";

const TARGETS = [
  { id: "general", label: "General LLM" },
  { id: "coding", label: "Coding" },
  { id: "image", label: "Image" },
  { id: "research", label: "Research" },
] as const;

export function PromptEnhancerTool() {
  const [prompt, setPrompt] = useState("Write a landing page headline for Gen Z Tools, a sleek browser toolkit.");
  const [target, setTarget] = useState<(typeof TARGETS)[number]["id"]>("general");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const enhance = async () => {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/ai/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, target }),
      });
      const payload = (await response.json()) as { text?: string; error?: string };
      if (!response.ok || !payload.text) throw new Error(payload.error || "Could not enhance the prompt.");
      setOutput(payload.text);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not enhance the prompt.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        The rough prompt is sent only when you press Enhance. The result is a prompt, not an answer to the task.
      </p>
      <div className="flex flex-wrap gap-2">
        {TARGETS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={target === item.id}
            onClick={() => setTarget(item.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              target === item.id ? "border-transparent bg-gradient-to-r from-violet-600 to-sky-500 text-white" : "glass-inset",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <Textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        aria-label="Rough prompt"
        placeholder="Describe the task in a sentence or two…"
        className="h-[min(10rem,28dvh)] resize-none font-sans"
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void enhance()} disabled={pending || prompt.trim().length === 0}>
          {pending ? "Expanding…" : "Enhance prompt"}
        </Button>
        <Button
          variant="outline"
          disabled={!output}
          onClick={() => {
            void copyText(output).then(() => toast.success("Copied"));
          }}
        >
          Copy prompt
        </Button>
      </div>
      <Textarea
        readOnly
        value={output}
        aria-label="Enhanced prompt"
        placeholder="The structured prompt appears here."
        className="h-[min(16rem,36dvh)] resize-none font-sans"
      />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
