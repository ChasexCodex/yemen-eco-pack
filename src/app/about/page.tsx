"use client";

import { SiteShell } from "@/components/site-shell";
import { useLanguage, useSiteSettings } from "@/components/app-providers";

export default function AboutPage() {
  const { lang } = useLanguage();
  const { settings } = useSiteSettings();
  const content = settings.page_content.about;
  const isArabic = lang === "ar";

  return (
    <SiteShell>
      <section className="container max-w-4xl py-24">
        <h1 className="mb-16 text-center text-4xl font-bold md:text-5xl">
          {isArabic ? content.title_ar : content.title_en}
        </h1>

        <div className="grid gap-16">
          <article className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 shadow-sm md:p-14">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/4 rounded-full bg-primary/5 blur-3xl" />
            <h2 className="relative z-10 mb-6 text-2xl font-bold text-primary">
              {isArabic ? content.mission_title_ar : content.mission_title_en}
            </h2>
            <p className="relative z-10 text-xl leading-relaxed text-muted">
              {isArabic ? content.mission_text_ar : content.mission_text_en}
            </p>
          </article>

          <article className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 shadow-sm md:p-14">
            <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 translate-y-1/2 -translate-x-1/4 rounded-full bg-accent/5 blur-3xl" />
            <h2 className="relative z-10 mb-6 text-2xl font-bold text-accent">
              {isArabic ? content.vision_title_ar : content.vision_title_en}
            </h2>
            <p className="relative z-10 text-xl leading-relaxed text-muted">
              {isArabic ? content.vision_text_ar : content.vision_text_en}
            </p>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
