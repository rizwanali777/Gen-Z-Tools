import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Gen Z Tools handles files, text, currency rates, and the AI tools that leave your browser.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
      <div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
        <p>
          Gen Z Tools is built so ordinary tools never need a server. PDF and Word conversion, text counts, case changes, caption
          styles, signatures, image export, audio trimming, JSON, CSV, Base64, QR codes, age, percentages, and unit
          conversion run in your browser. Those files and strings are not uploaded, and this app does not create an
          account or drop analytics cookies.
        </p>
        <p>
          AI tools are different. Remove Background, AI Grammar Fixer, AI Email Generator, and AI Prompt Enhancer send
          the current image or text to a Next.js route only after you press the button. That route forwards the payload
          to the Hugging Face Inference API with a server-side token and returns the result. The token is never shipped
          to the browser. Request bodies are not written to a database by this application.
        </p>
        <p>
          Currency conversion asks a public rate feed for exchange rates. The amount you type stays in the page.
        </p>
        <p>
          PDF to Word has an optional server fallback. It runs only if you press that button, extracts text, and
          returns a Word file. The local button does not use it.
        </p>
        <p>
          Exporting MP3 downloads the ffmpeg.wasm runtime from a public CDN the first time you ask for it. Your audio
          is encoded locally after that download. WAV export does not need the CDN.
        </p>
        <p>
          A short list of recently opened tool names is stored in local storage so the command menu can show them.
          Clearing site data removes that list.
        </p>
      </div>
    </article>
  );
}
