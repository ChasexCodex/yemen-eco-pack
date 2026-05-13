"use client";

import { useLanguage, useSiteSettings } from "@/components/app-providers";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/skeleton";
import { useApiSWR } from "@/lib/swr";
import type { Product } from "@/lib/types";

export function ProductsContent() {
  const { lang } = useLanguage();
  const { settings } = useSiteSettings();
  const { data: products = [], error, isLoading } = useApiSWR<Product[]>("/api/products");
  const content = settings.page_content.products;
  const isArabic = lang === "ar";

  return (
    <section className="container py-16">
      <div className="mb-12 max-w-3xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          {isArabic ? content.title_ar : content.title_en}
        </h1>
        <p className="text-lg text-muted">
          {isArabic ? content.subtitle_ar : content.subtitle_en}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-xl border border-border bg-card p-6 text-red-700">{error.message}</p>
      ) : products.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-6 text-muted">
          {isArabic ? content.empty_ar : content.empty_en}
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

function ProductCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-white p-6">
        <Skeleton className="aspect-square w-full rounded-xl" />
      </div>
      <div className="flex h-40 flex-col p-5">
        <Skeleton className="mb-3 h-3 w-1/3" />
        <Skeleton className="mb-2 h-6 w-4/5" />
        <Skeleton className="h-6 w-3/5" />
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </article>
  );
}
