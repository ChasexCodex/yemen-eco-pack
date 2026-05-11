import { SiteShell } from "@/components/site-shell";

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="container max-w-4xl py-24">
        <h1 className="mb-16 text-center text-4xl font-bold md:text-5xl">
          About BioPak
        </h1>

        <div className="grid gap-16">
          <article className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 shadow-sm md:p-14">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/4 rounded-full bg-primary/5 blur-3xl" />
            <h2 className="relative z-10 mb-6 text-2xl font-bold text-primary">
              Our Mission
            </h2>
            <p className="relative z-10 text-xl leading-relaxed text-muted">
              Our company specializes in providing sustainable and eco-friendly
              packaging solutions. We aim to reduce environmental impact by
              offering biodegradable packaging alternatives to traditional
              plastic packaging.
            </p>
          </article>

          <article className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 shadow-sm md:p-14">
            <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 translate-y-1/2 -translate-x-1/4 rounded-full bg-accent/5 blur-3xl" />
            <h2 className="relative z-10 mb-6 text-2xl font-bold text-accent">
              Our Vision
            </h2>
            <p className="relative z-10 text-xl leading-relaxed text-muted">
              To provide reliable and sustainable packaging solutions to meet
              the needs of various industries, while promoting the reduction of
              plastic use and raising awareness of the benefits of
              biodegradable packaging solutions.
            </p>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}

