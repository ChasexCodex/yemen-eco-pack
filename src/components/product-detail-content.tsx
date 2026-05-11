"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/app-providers";
import { apiRequest } from "@/lib/api-client";
import type { Product } from "@/lib/types";

export function ProductDetailContent({ id }: { id: string }) {
  const { lang, t } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Product>(`/api/products/${id}`)
      .then((item) => {
        setProduct(item);
        setError(null);
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "Unable to load product");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <section className="container py-20">
        <p className="rounded-xl border border-border bg-card p-6 text-muted">
          {t("products.loading")}
        </p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="container py-20">
        <p className="rounded-xl border border-border bg-card p-6 text-red-700">
          {error ?? "Product not found"}
        </p>
      </section>
    );
  }

  const name = lang === "ar" ? product.name_ar : product.name_en;
  const description = lang === "ar" ? product.description_ar : product.description_en;
  const category = lang === "ar" ? product.category_ar : product.category_en;
  const unit = lang === "ar" ? product.unit_ar : product.unit_en;

  return (
    <section className="container py-12 md:py-20">
      <Link
        href="/products"
        className="mb-12 inline-flex items-center text-sm font-medium text-muted hover:text-primary"
      >
        {lang === "ar" ? "→" : "←"} {t("products.backToProducts")}
      </Link>

      <div className="grid gap-14 lg:grid-cols-2">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-border bg-white p-12 shadow-sm">
          <img
            src={product.image_url}
            alt={name}
            className="h-full w-full object-contain"
          />
          {product.in_stock ? (
            <span className="absolute right-6 top-6 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
              {t("products.inStock")}
            </span>
          ) : null}
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
            {category}
          </p>
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">{name}</h1>

          <div className="mb-10 flex items-end gap-3 border-b border-border pb-10">
            <span className="text-4xl font-extrabold text-primary">
              ${product.price.toFixed(2)}
            </span>
            <span className="mb-1 text-xl text-muted">/ {unit}</span>
          </div>

          <p className="mb-10 text-lg leading-relaxed text-muted">{description}</p>

          <div className="mb-10 rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">{t("products.details")}</h2>
            <ul className="space-y-2 text-muted">
              <li>• {t("products.materialOptions")}</li>
              <li>• {t("products.foodService")}</li>
              <li>• {t("products.hotCold")}</li>
            </ul>
          </div>

          <Link
            href="/contact"
            className="inline-flex rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground transition hover:opacity-90"
          >
            {t("products.addToCart")}
          </Link>
        </div>
      </div>
    </section>
  );
}

