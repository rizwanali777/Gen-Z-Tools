"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copyText } from "@/lib/files";
import { cn } from "@/lib/utils";

const TONES = [
  { id: "professional", label: "Professional" },
  { id: "friendly", label: "Friendly" },
  { id: "firm", label: "Firm" },
  { id: "apologetic", label: "Apologetic" },
] as const;

const PURPOSES = [
  { id: "reply", label: "Reply" },
  { id: "follow-up", label: "Follow up" },
  { id: "thank-you", label: "Thank you" },
  { id: "decline", label: "Decline" },
  { id: "meeting", label: "Meeting" },
] as const;

export function EmailGeneratorTool() {
  const [bullets, setBullets] = useState("- Thanks for the proposal\n- We can start next Monday\n- Ask for the signed quote");
  const [tone, setTone] = useState<(typeof TONES)[number]["id"]>("professional");
  const [purpose, setPurpose] = useState<(typeof PURPOSES)[number]["id"]>("reply");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const generate = async () => {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/ai/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullets, tone, purpose }),
      });
      const payload = (await response.json()) as { text?: string; error?: string };
      if (!response.ok || !payload.text) throw new Error(payload.error || "Could not draft the email.");
      setOutput(payload.text);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not draft the email.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Notes stay in this tab until you press Generate. That sends them through the AI proxy.
      </p>
      <div className="flex flex-wrap gap-2">
        {PURPOSES.map((item) => (
          <Chip key={item.id} active={purpose === item.id} onClick={() => setPurpose(item.id)}>
            {item.label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {TONES.map((item) => (
          <Chip key={item.id} active={tone === item.id} onClick={() => setTone(item.id)}>
            {item.label}
          </Chip>
        ))}
      </div>
      <Textarea
        value={bullets}
        onChange={(event) => setBullets(event.target.value)}
        aria-label="Intent bullet points"
        placeholder={"- What happened\n- What you need\n- The deadline"}
        className="h-[min(12rem,32dvh)] resize-none font-sans"
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void generate()} disabled={pending || bullets.trim().length === 0}>
          {pending ? "Writing…" : "Generate email"}
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
      </div>
      <Textarea readOnly value={output} aria-label="Email draft" placeholder="The email appears here." className="h-[min(14rem,34dvh)] resize-none font-sans" />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm",
        active ? "border-transparent bg-gradient-to-r from-violet-600 to-sky-500 text-white" : "glass-inset",
      )}
    >
      {children}
    </button>
  );
}
