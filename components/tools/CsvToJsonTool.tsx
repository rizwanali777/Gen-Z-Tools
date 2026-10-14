"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dropzone } from "@/components/shared/Dropzone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { csvToJson, parseCsv } from "@/lib/csv";
import { copyText, downloadBlob } from "@/lib/files";

const SAMPLE = `name,role,city\nAda,Engineer,"London, UK"\nLin,Writer,Taipei`;

export function CsvToJsonTool() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState("");
  const [headers, setHeaders] = useState(true);
  const [error, setError] = useState("");

  const convert = (source = input) => {
    try {
      const rows = parseCsv(source);
      if (rows.length === 0) throw new Error("The CSV is empty.");
      const json = JSON.stringify(csvToJson(rows, headers), null, 2);
      setOutput(json);
      setError("");
      return json;
    } catch (cause) {
      setOutput("");
      setError(cause instanceof Error ? cause.message : "Could not parse that CSV.");
      return "";
    }
  };

  return (
    <div className="space-y-3">
      <Dropzone
        compact
        accept=".csv,text/csv,text/plain"
        title="Drop a CSV"
        detail="Or paste it in the editor."
        onFiles={(files) => {
          const file = files[0];
          if (!file) return;
          void file.text().then((text) => {
            setInput(text);
            convert(text);
          });
        }}
      />
      <Textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        aria-label="CSV input"
        className="h-[min(14rem,32dvh)] resize-none"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={headers} onChange={(event) => setHeaders(event.target.checked)} />
        First row is the header
      </label>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => convert()}>Convert</Button>
        <Button
          variant="outline"
          disabled={!output}
          onClick={() => {
            void copyText(output).then(() => toast.success("Copied"));
          }}
        >
          Copy JSON
        </Button>
        <Button
          variant="outline"
          disabled={!output}
          onClick={() => downloadBlob(new Blob([output], { type: "application/json" }), "data.json")}
        >
          Download
        </Button>
      </div>
      <Textarea readOnly value={output} aria-label="JSON output" placeholder="JSON appears here." className="h-[min(14rem,32dvh)] resize-none" />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
