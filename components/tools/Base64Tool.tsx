"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dropzone } from "@/components/shared/Dropzone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base64ToBytes, bytesToBase64, decodeText, encodeText } from "@/lib/base64";
import { copyText, downloadBlob } from "@/lib/files";
import { cn } from "@/lib/utils";

export function Base64Tool() {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("decoded.bin");

  const encodeInput = () => {
    setError("");
    setOutput(encodeText(input));
  };

  const decodeInput = () => {
    try {
      setError("");
      setOutput(decodeText(input));
    } catch (cause) {
      setOutput("");
      setError(cause instanceof Error ? cause.message : "Could not decode that text.");
    }
  };

  const encodeFile = async (file: File) => {
    setError("");
    setFileName(file.name);
    const bytes = new Uint8Array(await file.arrayBuffer());
    setOutput(bytesToBase64(bytes));
    setInput("");
    setMode("file");
  };

  const downloadDecoded = () => {
    try {
      const bytes = base64ToBytes(mode === "file" ? output || input : input);
      const copy = new Uint8Array(bytes.byteLength);
      copy.set(bytes);
      downloadBlob(new Blob([copy]), fileName || "decoded.bin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not decode that file.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["text", "file"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              mode === item ? "border-transparent bg-gradient-to-r from-violet-600 to-sky-500 text-white" : "glass-inset",
            )}
          >
            {item === "text" ? "Text" : "File"}
          </button>
        ))}
      </div>
      {mode === "file" ? (
        <Dropzone compact accept="*/*" title="Drop a file to encode" detail="The Base64 string appears below." onFiles={(files) => {
          const file = files[0];
          if (file) void encodeFile(file);
        }} />
      ) : null}
      <Textarea
        value={mode === "text" ? input : output}
        onChange={(event) => {
          if (mode === "text") setInput(event.target.value);
          else setOutput(event.target.value);
          setError("");
        }}
        aria-label={mode === "text" ? "Text or Base64" : "Base64 output"}
        placeholder={mode === "text" ? "Paste plain text or Base64…" : "Encoded file data appears here. You can also paste Base64 to download it."}
        className="h-[min(20rem,calc(100dvh-22rem))] resize-none"
      />
      {mode === "text" ? (
        <Textarea readOnly value={output} aria-label="Base64 result" placeholder="Result" className="h-28 resize-none" />
      ) : (
        <label className="block text-sm">
          Download name
          <input
            className="glass-inset mt-1 h-10 w-full rounded-lg border px-3 text-sm"
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
          />
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {mode === "text" ? (
          <>
            <Button onClick={encodeInput}>Encode</Button>
            <Button variant="outline" onClick={decodeInput}>
              Decode
            </Button>
          </>
        ) : (
          <Button onClick={downloadDecoded}>Download decoded file</Button>
        )}
        <Button
          variant="secondary"
          disabled={!(mode === "text" ? output : output)}
          onClick={() => {
            void copyText(mode === "text" ? output : output).then(() => toast.success("Copied"));
          }}
        >
          Copy
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
