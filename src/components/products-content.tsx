"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/app-providers";
import { ProductCard } from "@/components/product-card";
import { apiRequest } from "@/lib/api-client";
import type { Product } from "@/lib/types";

export function ProductsContent() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Product[]>("/api/products")
      .then((items) => {
        setProducts(items);
        setError(null);
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "Unable to load products");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="container py-16">
      <h1 className="mb-12 text-4xl font-bold text-foreground">{t("products.title")}</h1>

      {loading ? (
        <p className="rounded-xl border border-border bg-card p-6 text-muted">
          {t("products.loading")}
        </p>
      ) : error ? (
        <p className="rounded-xl border border-border bg-card p-6 text-red-700">{error}</p>
      ) : products.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-6 text-muted">
          {t("products.empty")}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

