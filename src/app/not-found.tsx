import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="container flex min-h-[55vh] items-center justify-center py-20">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted">
            404
          </p>
          <h1 className="mb-4 text-3xl font-bold">Page not found</h1>
          <p className="mb-8 text-muted">
            The page you requested does not exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:opacity-90"
          >
            Go to Home
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}

