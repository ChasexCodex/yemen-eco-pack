"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/app-providers";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { lang, t } = useLanguage();
  const name = lang === "ar" ? product.name_ar : product.name_en;
  const category = lang === "ar" ? product.category_ar : product.category_en;
  const unit = lang === "ar" ? product.unit_ar : product.unit_en;

  return (
    <Link href={`/products/${product.id}`} className="group h-full">
      <article className="h-full overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg">
        <div className="relative flex aspect-square items-center justify-center border-b border-border bg-white p-6">
          <Image
            src={product.image_url}
            alt={name}
            width={600}
            height={600}
            className="h-full w-full object-contain transition group-hover:scale-105"
          />
          <span
            className={`absolute top-4 rounded-full px-2.5 py-1 text-xs font-semibold ${
              lang === "ar" ? "left-4" : "right-4"
            } ${
              product.in_stock
                ? "bg-primary/10 text-primary"
                : "bg-red-100 text-red-700"
            }`}
          >
            {product.in_stock ? t("products.inStock") : t("products.outOfStock")}
          </span>
        </div>
        <div className="flex h-40 flex-col p-5">
          <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            {category}
          </span>
          <h3 className="mb-4 text-lg font-semibold">{name}</h3>
          <div className="mt-auto flex items-end justify-between gap-3">
            <span className="text-xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-muted">/ {unit}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

