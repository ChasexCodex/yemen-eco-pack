"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useLanguage, useSiteSettings } from "@/components/app-providers";
import { apiRequest } from "@/lib/api-client";
import { Skeleton } from "@/components/skeleton";
import type { Inquiry, InquiryInput } from "@/lib/types";

export function SiteFooter({ showContactForm = true }: { showContactForm?: boolean }) {
  const { lang, t } = useLanguage();
  const { settings, settingsLoading } = useSiteSettings();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const address = lang === "ar" ? settings.address_ar : settings.address_en;
  const tagline = lang === "ar" ? settings.tagline_ar : settings.tagline_en;

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    try {
      const payload: InquiryInput = {
        ...form,
        page: window.location.pathname,
      };
      await apiRequest<Inquiry>("/api/inquiries", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setForm({ name: "", email: "", message: "" });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className={`container grid gap-12 py-12 ${showContactForm ? "md:grid-cols-2" : ""}`}>
        {showContactForm ? (
          <div>
            <h3 className="mb-4 text-2xl font-bold">{t("contact.title")}</h3>
            <p className="mb-6 text-muted">
              {t("contact.subtitle")}
            </p>
            <form className="max-w-md space-y-4" onSubmit={onSubmit}>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                placeholder={t("contact.nameLabel")}
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                required
              />
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                placeholder={t("contact.emailLabel")}
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
              />
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                rows={4}
                placeholder={t("contact.messageLabel")}
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                required
              />
              <button
                className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-60"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? t("contact.submitting") : t("contact.submit")}
              </button>
              {status === "success" ? (
                <p className="text-sm font-medium text-primary">{t("contact.success")}</p>
              ) : null}
              {status === "error" ? (
                <p className="text-sm font-medium text-red-700">{t("contact.error")}</p>
              ) : null}
            </form>
          </div>
        ) : null}

        <div className={showContactForm ? "md:pl-12" : ""}>
          {settingsLoading ? (
            <>
              <div className="mb-4 flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded" />
                <Skeleton className="h-7 w-28" />
              </div>
              <div className="mb-6 space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-11/12" />
              </div>
              <div className="mb-6 space-y-3">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="h-5 w-2/5" />
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2">
                <Image
                  src={settings.logo_url}
                  alt="BioPak"
                  width={36}
                  height={36}
                  unoptimized
                  className="h-9 w-9 rounded p-1 object-contain"
                />
                <span className="text-2xl font-bold text-primary">BioPak</span>
              </div>
              <p className="mb-6 text-muted">
                {tagline}
              </p>
              <div className="mb-6 space-y-2">
                <p>
                  <span className="font-semibold">{t("contact.address")}:</span> {address}
                </p>
                <p>
                  <span className="font-semibold">{t("contact.email")}:</span>{" "}
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-primary">
                    {settings.contact_email}
                  </a>
                </p>
                <p>
                  <span className="font-semibold">{t("contact.phone")}:</span>{" "}
                  <a href={`tel:${settings.contact_phone}`} className="hover:text-primary" dir="ltr">
                    {settings.contact_phone}
                  </a>
                </p>
              </div>
            </>
          )}
          <div className="flex gap-4 text-sm text-muted">
            <Link href="/" className="hover:text-primary">
              {t("nav.home")}
            </Link>
            <Link href="/products" className="hover:text-primary">
              {t("nav.products")}
            </Link>
            <Link href="/materials" className="hover:text-primary">
              {t("nav.materials")}
            </Link>
            <Link href="/about" className="hover:text-primary">
              {t("nav.about")}
            </Link>
            <Link href="/contact" className="hover:text-primary">
              {t("nav.contact")}
            </Link>
          </div>
        </div>
      </div>

      <div className="container border-t border-border/70 py-6 text-center text-sm text-muted">
        {t("footer.copyright")}
      </div>
    </footer>
  );
}
