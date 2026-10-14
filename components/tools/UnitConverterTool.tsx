"use client";

import { ArrowLeftRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatQuantity } from "@/lib/format";
import { convertUnits, unitGroups } from "@/lib/units";
import { cn } from "@/lib/utils";

const CURRENCY_LABELS: Record<string, string> = {
  USD: "US dollar",
  EUR: "Euro",
  GBP: "British pound",
  JPY: "Japanese yen",
  CNY: "Chinese yuan",
  INR: "Indian rupee",
  PKR: "Pakistani rupee",
  AED: "UAE dirham",
  SAR: "Saudi riyal",
  CAD: "Canadian dollar",
  AUD: "Australian dollar",
  CHF: "Swiss franc",
};

type Rates = { updated: string; rates: Record<string, number> };

export function UnitConverterTool() {
  const [groupId, setGroupId] = useState(unitGroups[0]?.id ?? "length");
  const [from, setFrom] = useState(unitGroups[0]?.units[0]?.id ?? "m");
  const [to, setTo] = useState(unitGroups[0]?.units[1]?.id ?? "cm");
  const [value, setValue] = useState("1");
  const [rates, setRates] = useState<Rates | null>(null);
  const [rateError, setRateError] = useState("");
  const [rateState, setRateState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (groupId !== "currency" || rates) return;
    let cancelled = false;
    setRateState("loading");
    setRateError("");
    void fetch("/api/rates/currency")
      .then(async (response) => {
        const payload = (await response.json()) as Rates & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Could not load rates.");
        if (cancelled) return;
        setRates(payload);
        setRateState("ready");
        setFrom((current) => (payload.rates[current] ? current : "USD"));
        setTo((current) => (payload.rates[current] && current !== "USD" ? current : "EUR"));
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setRateError(cause instanceof Error ? cause.message : "Could not load rates.");
        setRateState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [groupId, rates]);

  const currencyUnits = useMemo(() => {
    const codes = Object.keys(rates?.rates ?? {});
    return codes.map((id) => ({ id, label: `${id} · ${CURRENCY_LABELS[id] ?? id}` }));
  }, [rates]);

  const groups = useMemo(
    () => [
      ...unitGroups.map((item) => ({ id: item.id, label: item.label, units: item.units })),
      {
        id: "currency",
        label: "Currency",
        units: currencyUnits.length ? currencyUnits : [{ id: "USD", label: "USD" }],
      },
    ],
    [currencyUnits],
  );
  const group = groups.find((item) => item.id === groupId) ?? groups[0];

  const result = useMemo(() => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return Number.NaN;
    if (groupId !== "currency") return convertUnits(groupId, from, to, amount);
    const source = rates?.rates[from];
    const target = rates?.rates[to];
    if (!source || !target) return Number.NaN;
    return (amount / source) * target;
  }, [groupId, from, to, value, rates]);

  const selectGroup = (id: string) => {
    setGroupId(id);
    if (id === "currency") {
      setFrom("USD");
      setTo("EUR");
      return;
    }
    const next = unitGroups.find((item) => item.id === id);
    setFrom(next?.units[0]?.id ?? "");
    setTo(next?.units[1]?.id ?? next?.units[0]?.id ?? "");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {groups.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === groupId}
            onClick={() => selectGroup(item.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              item.id === groupId ? "border-transparent bg-gradient-to-r from-violet-600 to-sky-500 text-white" : "glass-inset",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <label className="text-sm font-medium">
          From
          <Input className="mt-1" inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} />
          <UnitSelect className="mt-2" units={group?.units ?? []} value={from} onChange={setFrom} />
        </label>
        <Button
          variant="outline"
          size="icon"
          className="mb-1"
          aria-label="Swap units"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
        >
          <ArrowLeftRight className="size-4" />
        </Button>
        <label className="text-sm font-medium">
          To
          <div className="glass-inset mt-1 flex h-10 items-center rounded-lg border px-3 font-mono text-sm">
            {groupId === "currency" && rateState === "loading" ? "Loading rates…" : formatQuantity(result)}
          </div>
          <UnitSelect className="mt-2" units={group?.units ?? []} value={to} onChange={setTo} />
        </label>
      </div>
      {groupId === "currency" ? (
        <p className="text-xs text-muted-foreground">
          {rateError
            ? rateError
            : rates
              ? `Live rates based on USD, updated ${rates.updated}. Your amount stays in this tab.`
              : "Currency uses a public rate feed. Length, temperature, and storage stay offline."}
        </p>
      ) : null}
    </div>
  );
}

function UnitSelect({
  units,
  value,
  onChange,
  className,
}: {
  units: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <select
      className={cn("glass-inset h-10 w-full rounded-lg border px-3 text-sm", className)}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {units.map((unit) => (
        <option key={unit.id} value={unit.id}>
          {unit.label}
        </option>
      ))}
    </select>
  );
}
