import { SiteShell } from "@/components/site-shell";

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="container max-w-6xl py-20">
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">Contact Us</h1>
          <p className="mx-auto max-w-2xl text-xl text-muted">
            Have a question or want to place a large order? Get in touch.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-5 lg:gap-24">
          <div className="space-y-10 lg:col-span-2">
            <div className="flex flex-col gap-8 rounded-3xl border border-border bg-card p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  📍
                </div>
                <div>
                  <h2 className="mb-1 text-lg font-bold text-foreground">
                    Address
                  </h2>
                  <p className="text-lg text-muted">Sana&apos;a, Yemen</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  ✉️
                </div>
                <div>
                  <h2 className="mb-1 text-lg font-bold text-foreground">
                    Email
                  </h2>
                  <a
                    href="mailto:info@biopak.ye"
                    className="text-lg text-muted transition-colors hover:text-primary"
                  >
                    info@biopak.ye
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  📞
                </div>
                <div>
                  <h2 className="mb-1 text-lg font-bold text-foreground">
                    Phone
                  </h2>
                  <a
                    href="tel:+967-1-555-0100"
                    className="text-lg text-muted transition-colors hover:text-primary"
                  >
                    +967-1-555-0100
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm md:p-12">
              <h2 className="mb-8 text-2xl font-bold">Send an Inquiry</h2>
              <form className="space-y-6">
                <div>
                  <label className="mb-2 block text-base font-medium">Name</label>
                  <input className="h-12 w-full rounded-lg border border-border bg-white px-3 py-2" />
                </div>
                <div>
                  <label className="mb-2 block text-base font-medium">Email</label>
                  <input
                    type="email"
                    className="h-12 w-full rounded-lg border border-border bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-base font-medium">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2"
                  />
                </div>
                <button className="h-14 w-full rounded-lg bg-primary px-4 text-lg font-semibold text-primary-foreground transition hover:opacity-90">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

