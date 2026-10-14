import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Acceptable use for the Gen Z Tools utilities.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Terms</h1>
      <div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
        <p>
          Gen Z Tools is provided as a free set of browser utilities. You are responsible for the files and text you
          process, and for having the rights to do so. Do not use the tools to break the law or to abuse the AI proxy.
        </p>
        <p>
          Conversions are best-effort. PDF text extraction does not reconstruct complex layouts, and it cannot read
          scans. Image, audio, and data tools depend on the browser you use. Check the output before you rely on it.
        </p>
        <p>
          AI features depend on a third-party model and on the token configured for this deployment. They can be
          unavailable, slow, or wrong. Do not send secrets, credentials, or data you are not allowed to transmit.
        </p>
        <p>
          The software is provided without a warranty of fitness for a particular purpose. To the extent the law
          allows, the operators are not liable for lost data or decisions made from a tool&apos;s output.
        </p>
      </div>
    </article>
  );
}
