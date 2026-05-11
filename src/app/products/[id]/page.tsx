import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { getProductById, products } from "@/lib/products";

export function generateStaticParams() {
  return products.map((product) => ({ id: String(product.id) }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(Number(id));

  if (!product) {
    notFound();
  }

  return (
    <SiteShell>
      <section className="container py-12 md:py-20">
        <Link
          href="/products"
          className="mb-12 inline-flex items-center text-sm font-medium text-muted hover:text-primary"
        >
          ← Back to Products
        </Link>

        <div className="grid gap-14 lg:grid-cols-2">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-border bg-white p-12 shadow-sm">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain"
            />
            {product.inStock ? (
              <span className="absolute right-6 top-6 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
                In Stock
              </span>
            ) : null}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
              {product.category}
            </p>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">{product.name}</h1>

            <div className="mb-10 flex items-end gap-3 border-b border-border pb-10">
              <span className="text-4xl font-extrabold text-primary">
                ${product.price.toFixed(2)}
              </span>
              <span className="mb-1 text-xl text-muted">/ {product.unit}</span>
            </div>

            <p className="mb-10 text-lg leading-relaxed text-muted">
              {product.description}
            </p>

            <div className="mb-10 rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Product Details</h2>
              <ul className="space-y-2 text-muted">
                <li>• 100% biodegradable or compostable material options</li>
                <li>• Suitable for food service and takeaway use</li>
                <li>• Built for hot and cold applications</li>
              </ul>
            </div>

            <Link
              href="/contact"
              className="inline-flex rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Inquire About Product
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

