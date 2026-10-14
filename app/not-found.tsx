import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">404</p>
      <h1 className="mt-2 text-3xl font-semibold">That page is not in the set</h1>
      <p className="mt-2 text-sm text-muted-foreground">The address does not match a page in the registry.</p>
      <Link href="/" className="mt-4 inline-block text-sm font-medium text-primary">
        Back to all tools
      </Link>
    </div>
  );
}
