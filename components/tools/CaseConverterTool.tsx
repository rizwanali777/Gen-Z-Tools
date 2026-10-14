"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { caseActions } from "@/lib/text";
import { copyText } from "@/lib/files";

export function CaseConverterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [active, setActive] = useState<string>("title");

  const apply = (id: string) => {
    const action = caseActions.find((item) => item.id === id);
    if (!action) return;
    setActive(id);
    setOutput(action.apply(input));
  };

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        aria-label="Text to convert"
        placeholder="Paste text to recase…"
        className="h-[min(24rem,calc(100dvh-20rem))] resize-none"
      />
      <Textarea
        readOnly
        value={output}
        aria-label="Converted text"
        placeholder="The converted text appears here."
        className="h-[min(24rem,calc(100dvh-20rem))] resize-none"
      />
      <div className="flex flex-wrap gap-2 lg:col-span-2">
        {caseActions.map((action) => (
          <Button
            key={action.id}
            size="sm"
            variant={active === action.id ? "default" : "outline"}
            onClick={() => apply(action.id)}
          >
            {action.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant="secondary"
          className="ml-auto"
          disabled={!output}
          onClick={() => {
            void copyText(output).then(() => toast.success("Copied"));
          }}
        >
          Copy result
        </Button>
      </div>
    </div>
  );
}
