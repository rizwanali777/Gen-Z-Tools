"use client";

import { Upload } from "lucide-react";
import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type DropzoneProps = {
  accept?: string;
  multiple?: boolean;
  compact?: boolean;
  title?: string;
  detail?: string;
  onFiles: (files: File[]) => void;
};

export function Dropzone({ accept, multiple = false, compact = false, title, detail, onFiles }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);

  const take = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (files.length === 0) return;
    onFiles(multiple ? files : files.slice(0, 1));
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setActive(false);
    take(event.dataTransfer.files);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={onKeyDown}
      onDragOver={(event) => {
        event.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={onDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center transition",
        compact ? "min-h-24" : "min-h-[min(22rem,calc(100dvh-15rem))]",
        active ? "border-sky-400 bg-sky-400/10" : "glass-inset border-white/70 hover:border-violet-400 dark:border-white/15",
      )}
    >
      <Upload className={cn("text-primary", compact ? "mb-1 size-4" : "mb-3 size-8")} aria-hidden />
      <p className={cn("font-medium", compact ? "text-sm" : "text-base")}>{title ?? "Drop a file here"}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail ?? "or click to browse"}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          take(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
