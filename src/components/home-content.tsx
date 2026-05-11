"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/app-providers";
import { ProductCard } from "@/components/product-card";
import { apiRequest } from "@/lib/api-client";
import type { Product } from "@/lib/types";

export function HomeContent() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Product[]>("/api/products")
      .then((items) => {
        setProducts(items.slice(0, 4));
        setError(null);
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "Unable to load products");
      });
  }, []);

  return (
    <main>
      <section className="bg-primary/5 py-24 lg:py-32">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mb-8 max-w-xl text-lg text-muted">
              {t("home.heroSubtitle")}
            </p>
            <Link
              href="/products"
              className="inline-flex rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow transition hover:opacity-90"
            >
              {t("home.shopNow")}
            </Link>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-border shadow-xl">
              <img
                src="/hero.png"
                alt="Eco-friendly packaging"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-accent/30 blur-2xl" />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-3xl font-bold">{t("home.featuredProducts")}</h2>
            <Link href="/products" className="hidden text-sm font-semibold text-primary hover:underline sm:block">
              {t("home.viewAll")}
            </Link>
          </div>
          {error ? (
            <p className="rounded-xl border border-border bg-card p-6 text-muted">{error}</p>
          ) : products.length === 0 ? (
            <p className="rounded-xl border border-border bg-card p-6 text-muted">
              {t("products.loading")}
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-border bg-card py-20">
        <div className="container grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Leaf className="h-10 w-10" aria-hidden="true" />
          </div>
          <div>
            <h2 className="mb-4 text-3xl font-bold">{t("home.whyBiodegradable")}</h2>
            <p className="max-w-4xl text-lg leading-relaxed text-muted">
              {t("home.whyBiodegradableText")}
            </p>
            <Link href="/materials" className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline">
              {t("home.learnMaterials")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

