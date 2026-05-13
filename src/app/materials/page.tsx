"use client";

import { SiteShell } from "@/components/site-shell";
import { useLanguage, useSiteSettings } from "@/components/app-providers";

export default function MaterialsPage() {
  const { lang } = useLanguage();
  const { settings } = useSiteSettings();
  const content = settings.page_content.materials;
  const isArabic = lang === "ar";

  return (
    <SiteShell>
      <section className="border-b border-border bg-primary/5 py-20">
        <div className="container max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">
            {isArabic ? content.title_ar : content.title_en}
          </h1>
          <p className="text-xl text-muted">
            {isArabic ? content.subtitle_ar : content.subtitle_en}
          </p>
        </div>
      </section>

      <section className="container max-w-4xl py-20">
        <div className="space-y-24">
          {content.items.map((material) => (
            <article key={material.id} id={material.id} className="scroll-mt-32">
              <h2 className="mb-6 text-3xl font-bold text-primary">
                {isArabic ? material.title_ar : material.title_en}
              </h2>

              <p className="mb-4 text-lg font-medium text-foreground">
                {isArabic ? material.what_ar : material.what_en}
              </p>
              <p className="mb-8 text-lg text-muted">
                {isArabic ? material.benefits_ar : material.benefits_en}
              </p>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                  {isArabic ? content.references_label_ar : content.references_label_en}
                </h3>
                <ul className="space-y-3">
                  {material.links.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        {link.title} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
