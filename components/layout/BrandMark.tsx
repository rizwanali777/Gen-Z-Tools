import { useId } from "react";
import { cn } from "@/lib/utils";

export function BrandMark({ className, wordmark = true }: { className?: string; wordmark?: boolean }) {
  const gradientId = useId().replace(/:/g, "");

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="6" y1="6" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="10" className="fill-black dark:fill-white" />
        <path
          d="M8.4 10.2h15.4L9.2 21.8h14.8"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {wordmark ? (
        <span className="text-[15px] font-semibold tracking-[-0.045em]">
          Gen{" "}
          <span className="bg-gradient-to-br from-violet-600 via-fuchsia-500 to-sky-400 bg-clip-text text-transparent">
            Z
          </span>{" "}
          Tools
        </span>
      ) : null}
    </span>
  );
}
