"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/app-providers";
import { Skeleton } from "@/components/skeleton";
import { useApiSWR } from "@/lib/swr";
import type { Product } from "@/lib/types";

export function ProductDetailContent({ id }: { id: string }) {
  const { lang, t } = useLanguage();
  const { data: product, error, isLoading } = useApiSWR<Product>(
    id ? `/api/products/${id}` : null,
  );

  if (isLoading) {
    return (
      <section className="container py-12 md:py-20">
        <ProductDetailSkeleton />
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="container py-20">
        <p className="rounded-xl border border-border bg-card p-6 text-red-700">
          {error?.message ?? "Product not found"}
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
          <Image
            src={product.image_url}
            alt={name}
            width={900}
            height={900}
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

function ProductDetailSkeleton() {
  return (
    <>
      <Skeleton className="mb-12 h-5 w-40" />
      <div className="grid gap-14 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-white p-12 shadow-sm">
          <Skeleton className="aspect-square w-full rounded-2xl" />
        </div>
        <div>
          <Skeleton className="mb-3 h-4 w-28" />
          <Skeleton className="mb-4 h-12 w-4/5" />
          <Skeleton className="mb-10 h-16 w-40" />
          <Skeleton className="mb-3 h-5 w-full" />
          <Skeleton className="mb-3 h-5 w-11/12" />
          <Skeleton className="mb-10 h-5 w-4/5" />
          <div className="mb-10 rounded-2xl border border-border bg-card p-6">
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-10/12" />
            </div>
          </div>
          <Skeleton className="h-12 w-48 rounded-lg" />
        </div>
      </div>
    </>
  );
}

