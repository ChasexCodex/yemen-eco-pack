import Link from "next/link";

export default function Home() {
  const featuredProducts = [
    { name: "9x9 Clamshell Box", category: "Bagasse", unit: "piece", price: 0.18, image: "/products/clamshell-9x9.png" },
    { name: "16oz PLA Cold Cup", category: "PLA", unit: "cup", price: 0.22, image: "/products/pla-cold-cup-16oz.png" },
    { name: "Kraft Paper Straws", category: "Kraft Paper", unit: "pack", price: 1.45, image: "/products/kraft-straws.png" },
    { name: "2oz Portion Cup", category: "Compostable", unit: "piece", price: 0.08, image: "/products/portion-cup-2oz.png" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="BioPak logo" className="h-8 w-8 rounded bg-white p-1 object-contain" />
            <span className="text-xl font-bold text-primary">BioPak</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#" className="text-sm font-medium hover:text-primary">Home</Link>
            <Link href="#" className="text-sm font-medium hover:text-primary">Products</Link>
            <Link href="#" className="text-sm font-medium hover:text-primary">Materials</Link>
            <Link href="#" className="text-sm font-medium hover:text-primary">About</Link>
            <Link href="#" className="text-sm font-medium hover:text-primary">Contact</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="bg-primary/5 py-24 lg:py-32">
          <div className="container grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Sustainable Packaging for a Greener Tomorrow
              </h1>
              <p className="mb-8 max-w-xl text-lg text-muted">
                BioPak provides eco-friendly, biodegradable food packaging solutions in Yemen.
              </p>
              <button className="rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow transition hover:opacity-90">
                Shop Now
              </button>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-border shadow-xl">
                <img src="/hero.png" alt="Eco-friendly packaging" className="aspect-[4/3] w-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-accent/30 blur-2xl" />
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Link href="#" className="hidden text-sm font-semibold text-primary hover:underline sm:block">
                View All Products
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <article key={product.name} className="group overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex aspect-square items-center justify-center border-b border-border bg-white p-6">
                    <img src={product.image} alt={product.name} className="h-full w-full object-contain transition group-hover:scale-105" />
                  </div>
                  <div className="flex h-40 flex-col p-5">
                    <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{product.category}</span>
                    <h3 className="mb-4 text-lg font-semibold">{product.name}</h3>
                    <div className="mt-auto flex items-end justify-between">
                      <span className="text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
                      <span className="text-sm text-muted">/ {product.unit}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card py-20">
          <div className="container grid items-center gap-8 md:grid-cols-[auto_1fr]">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl">🌿</div>
            <div>
              <h2 className="mb-4 text-3xl font-bold">Why Biodegradable?</h2>
              <p className="max-w-4xl text-lg leading-relaxed text-muted">
                Traditional plastics take hundreds of years to decompose, choking our landfills and oceans. Our plant-based packaging breaks down naturally, returning safely to the earth.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-border bg-card">
        <div className="container grid gap-12 py-12 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-2xl font-bold">Contact Us</h3>
            <p className="mb-6 text-muted">Have a question or want to place a large order? Get in touch.</p>
            <form className="max-w-md space-y-4">
              <input className="w-full rounded-lg border border-border bg-white px-3 py-2" placeholder="Name" />
              <input className="w-full rounded-lg border border-border bg-white px-3 py-2" placeholder="Email" />
              <textarea className="w-full rounded-lg border border-border bg-white px-3 py-2" rows={4} placeholder="Message" />
              <button className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground">Send Message</button>
            </form>
          </div>
          <div className="md:pl-12">
            <div className="mb-4 flex items-center gap-2">
              <img src="/logo.png" alt="BioPak" className="h-9 w-9 rounded bg-white p-1 object-contain" />
              <span className="text-2xl font-bold text-primary">BioPak</span>
            </div>
            <p className="mb-6 text-muted">Sustainable solutions for a greener Yemen.</p>
            <div className="space-y-2">
              <p><span className="font-semibold">Address:</span> Sana&apos;a, Yemen</p>
              <p><span className="font-semibold">Email:</span> info@biopak.ye</p>
              <p><span className="font-semibold">Phone:</span> +967-1-555-0100</p>
            </div>
          </div>
        </div>
        <div className="container border-t border-border/70 py-6 text-center text-sm text-muted">
          © 2024 BioPak. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
