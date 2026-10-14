"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { calculateAgePrecise, dateDifference, nowLocalInput } from "@/lib/age";
import { cn } from "@/lib/utils";

type Mode = "age" | "span";

export function AgeCalculatorTool() {
  const [mode, setMode] = useState<Mode>("age");
  const [birth, setBirth] = useState("1996-04-12T08:30");
  const [asOf, setAsOf] = useState("");
  const [start, setStart] = useState("2024-01-01T09:00");
  const [end, setEnd] = useState("");

  useEffect(() => {
    const now = nowLocalInput();
    setAsOf(now);
    setEnd(now);
  }, []);

  const age = useMemo(() => (asOf ? calculateAgePrecise(birth, asOf) : null), [birth, asOf]);
  const span = useMemo(() => (end ? dateDifference(start, end) : null), [start, end]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Calculator mode">
        <ModeChip active={mode === "age"} onClick={() => setMode("age")}>
          Age
        </ModeChip>
        <ModeChip active={mode === "span"} onClick={() => setMode("span")}>
          Date difference
        </ModeChip>
      </div>
      {mode === "age" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Born
              <Input className="mt-1" type="datetime-local" value={birth} onChange={(event) => setBirth(event.target.value)} />
            </label>
            <label className="text-sm font-medium">
              As of
              <Input className="mt-1" type="datetime-local" value={asOf} onChange={(event) => setAsOf(event.target.value)} />
            </label>
          </div>
          {!age ? (
            <p className="text-sm text-muted-foreground">Calculating from this minute…</p>
          ) : "error" in age ? (
            <p className="text-sm text-destructive" role="alert">
              {age.error}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <Readout label="Years" value={age.years} />
                <Readout label="Months" value={age.months} />
                <Readout label="Days" value={age.days} />
                <Readout label="Hours" value={age.hours} />
                <Readout label="Minutes" value={age.minutes} />
              </div>
              <p className="text-sm text-muted-foreground">
                {age.totalWeeks.toLocaleString()} weeks · {age.totalDays.toLocaleString()} days ·{" "}
                {age.totalHours.toLocaleString()} hours · {age.totalMinutes.toLocaleString()} minutes. Born on a {age.bornOn}.
                {age.daysUntilBirthday === 0
                  ? " The next birthday is today."
                  : ` Next birthday in ${age.daysUntilBirthday} days.`}
              </p>
            </>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Start
              <Input className="mt-1" type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} />
            </label>
            <label className="text-sm font-medium">
              End
              <Input className="mt-1" type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
            </label>
          </div>
          {!span ? (
            <p className="text-sm text-muted-foreground">Choose an end date.</p>
          ) : "error" in span ? (
            <p className="text-sm text-destructive" role="alert">
              {span.error}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Readout label="Weeks" value={span.weeks} />
                <Readout label="Days" value={span.days} />
                <Readout label="Hours" value={span.hours} />
                <Readout label="Minutes" value={span.minutes} />
              </div>
              <p className="text-sm text-muted-foreground">
                {span.negative ? "The end is before the start. " : ""}
                {span.totalDays.toLocaleString()} days · {span.totalHours.toLocaleString()} hours ·{" "}
                {span.totalMinutes.toLocaleString()} minutes.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ModeChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
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

function Readout({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-background px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-mono text-2xl">{value.toLocaleString()}</p>
    </div>
  );
}
