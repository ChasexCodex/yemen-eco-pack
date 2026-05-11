import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { products } from "@/lib/products";

export default function ProductsPage() {
  return (
    <SiteShell>
      <section className="container py-16">
        <h1 className="mb-12 text-4xl font-bold text-foreground">Our Products</h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group h-full"
            >
              <article className="h-full overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg">
                <div className="relative flex aspect-square items-center justify-center border-b border-border bg-white p-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain transition group-hover:scale-105"
                  />
                  <span
                    className={`absolute right-4 top-4 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      product.inStock
                        ? "bg-primary/10 text-primary"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <div className="flex h-40 flex-col p-5">
                  <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    {product.category}
                  </span>
                  <h3 className="mb-4 text-lg font-semibold">{product.name}</h3>
                  <div className="mt-auto flex items-end justify-between">
                    <span className="text-xl font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted">/ {product.unit}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

