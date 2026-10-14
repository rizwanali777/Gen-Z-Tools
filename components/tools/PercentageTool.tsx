"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { formatQuantity } from "@/lib/format";
import { applyDiscount, marginFromPrices, percentChange, percentOf, priceFromMargin, splitTip } from "@/lib/percent";
import { cn } from "@/lib/utils";

type Mode = "of" | "change" | "discount" | "tip" | "margin";

const modes: { id: Mode; label: string }[] = [
  { id: "of", label: "Percent of" },
  { id: "change", label: "Change" },
  { id: "discount", label: "Discount" },
  { id: "tip", label: "Tip" },
  { id: "margin", label: "Margin" },
];

export function PercentageTool() {
  const [mode, setMode] = useState<Mode>("discount");
  const [a, setA] = useState("25");
  const [b, setB] = useState("80");
  const [c, setC] = useState("2");
  const [marginTarget, setMarginTarget] = useState("40");

  const amountA = Number(a);
  const amountB = Number(b);
  const amountC = Number(c);

  const summary = useMemo(() => {
    if (!Number.isFinite(amountA) || !Number.isFinite(amountB)) return "Enter numbers to calculate.";
    if (mode === "of") return `${formatQuantity(amountA)}% of ${formatQuantity(amountB)} is ${formatQuantity(percentOf(amountA, amountB))}.`;
    if (mode === "change") {
      const change = percentChange(amountA, amountB);
      if (!Number.isFinite(change)) return "The starting number cannot be zero.";
      const diff = amountB - amountA;
      return `${formatQuantity(amountA)} to ${formatQuantity(amountB)} is ${formatQuantity(change)}% (${diff >= 0 ? "+" : ""}${formatQuantity(diff)}).`;
    }
    if (mode === "discount") {
      const deal = applyDiscount(amountB, amountA);
      return `${formatQuantity(amountA)}% off ${formatQuantity(amountB)} saves ${formatQuantity(deal.saved)}. You pay ${formatQuantity(deal.finalPrice)}.`;
    }
    if (mode === "tip") {
      const people = Number.isFinite(amountC) && amountC > 0 ? amountC : 1;
      const split = splitTip(amountB, amountA, people);
      return `${formatQuantity(amountA)}% tip on ${formatQuantity(amountB)} is ${formatQuantity(split.tip)}. Total ${formatQuantity(split.total)}, ${formatQuantity(split.each)} each for ${people}.`;
    }
    const target = Number(marginTarget);
    const quoted = marginFromPrices(amountA, amountB);
    const priced = Number.isFinite(target) ? priceFromMargin(amountA, target) : null;
    const fromPrices = `Cost ${formatQuantity(amountA)} selling at ${formatQuantity(amountB)} makes ${formatQuantity(quoted.profit)} profit, a ${formatQuantity(quoted.margin)}% margin and ${formatQuantity(quoted.markup)}% markup.`;
    if (!priced) return `${fromPrices} Target margin must be under 100%.`;
    return `${fromPrices} A ${formatQuantity(target)}% margin on that cost sells for ${formatQuantity(priced.price)}.`;
  }, [mode, amountA, amountB, amountC, marginTarget]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={mode === item.id}
            onClick={() => setMode(item.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              mode === item.id ? "border-transparent bg-gradient-to-r from-violet-600 to-sky-500 text-white" : "glass-inset",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={cn("grid gap-3", mode === "tip" || mode === "margin" ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
        <Field label={labels(mode).a} value={a} onChange={setA} />
        <Field label={labels(mode).b} value={b} onChange={setB} />
        {mode === "tip" ? <Field label="People" value={c} onChange={setC} /> : null}
        {mode === "margin" ? <Field label="Target margin %" value={marginTarget} onChange={setMarginTarget} /> : null}
      </div>
      <p className="rounded-xl bg-background px-3 py-3 text-sm leading-6" aria-live="polite">
        {summary}
      </p>
    </div>
  );
}

function labels(mode: Mode): { a: string; b: string } {
  if (mode === "of") return { a: "Percent", b: "Number" };
  if (mode === "change") return { a: "From", b: "To" };
  if (mode === "discount") return { a: "Percent off", b: "Price" };
  if (mode === "tip") return { a: "Tip percent", b: "Bill" };
  return { a: "Cost", b: "Selling price" };
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm font-medium">
      {label}
      <Input className="mt-1" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
