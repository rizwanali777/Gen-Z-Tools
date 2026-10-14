"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold">This page hit a snag</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message || "Reload and try the action again."}</p>
      <Button className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
