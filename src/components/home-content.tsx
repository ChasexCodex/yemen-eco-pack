"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Leaf } from "lucide-react";
import { useLanguage, useSiteSettings } from "@/components/app-providers";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/skeleton";
import { useApiSWR } from "@/lib/swr";
import type { Product } from "@/lib/types";

export function HomeContent() {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();
  const { data, error, isLoading } = useApiSWR<Product[]>("/api/products");
  const products = data?.slice(0, 4) ?? [];
  const heroImages = useMemo(
    () => (settings.hero_images.length > 0 ? settings.hero_images : ["/hero.png"]),
    [settings.hero_images],
  );

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
              href="/materials"
              className="inline-flex rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow transition hover:opacity-90"
            >
              {t("home.shopNow")}
            </Link>
          </div>
          <div className="relative">
            <HeroCarousel images={heroImages} />
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
            <p className="rounded-xl border border-border bg-card p-6 text-muted">{error.message}</p>
          ) : isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="rounded-xl border border-border bg-card p-6 text-muted">{t("products.empty")}</p>
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

function HeroCarousel({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const currentIndex = activeIndex >= images.length ? 0 : activeIndex;

  const showControls = images.length > 1;

  const goToPrevious = () => {
    setActiveIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setActiveIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const finishDrag = (endX: number | null) => {
    if (dragStartX === null || endX === null) {
      setDragStartX(null);
      return;
    }

    const delta = endX - dragStartX;
    if (delta <= -40) {
      goToNext();
    } else if (delta >= 40) {
      goToPrevious();
    }

    setDragStartX(null);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-xl">
      <div
        className="relative aspect-[4/3] select-none overflow-hidden bg-card"
        onMouseDown={(event) => setDragStartX(event.clientX)}
        onMouseUp={(event) => finishDrag(event.clientX)}
        onMouseLeave={() => finishDrag(null)}
        onTouchStart={(event) => setDragStartX(event.touches[0]?.clientX ?? null)}
        onTouchEnd={(event) => finishDrag(event.changedTouches[0]?.clientX ?? null)}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="relative h-full min-w-full">
              <Image
                src={image}
                alt={`Eco-friendly packaging ${index + 1}`}
                width={1200}
                height={900}
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        {showControls ? (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/85 p-2 text-foreground shadow transition hover:bg-background"
              aria-label="Previous hero image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/85 p-2 text-foreground shadow transition hover:bg-background"
              aria-label="Next hero image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-background/80 px-3 py-2 shadow">
              {images.map((image, index) => (
                <button
                  key={`${image}-dot-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    index === currentIndex ? "bg-primary" : "bg-border"
                  }`}
                  aria-label={`Show hero image ${index + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
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
