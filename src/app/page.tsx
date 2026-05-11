import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { products } from "@/lib/products";

export default function Home() {
  const featuredProducts = products.slice(0, 4);

  return (
    <SiteShell>
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
              <Link
                href="/products"
                className="inline-flex rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow transition hover:opacity-90"
              >
                Shop Now
              </Link>
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
              <Link href="/products" className="hidden text-sm font-semibold text-primary hover:underline sm:block">
                View All Products
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg"
                >
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
                </Link>
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
              <Link href="/materials" className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline">
                Learn about our materials
              </Link>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
