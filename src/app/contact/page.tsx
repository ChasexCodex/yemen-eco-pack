"use client";

import { FormEvent, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useLanguage, useSiteSettings } from "@/components/app-providers";
import { apiRequest } from "@/lib/api-client";
import type { Inquiry, InquiryInput } from "@/lib/types";

export default function ContactPage() {
  const { lang, t } = useLanguage();
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const address = lang === "ar" ? settings.address_ar : settings.address_en;

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
    <SiteShell>
      <section className="container max-w-6xl py-20">
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">{t("contact.title")}</h1>
          <p className="mx-auto max-w-2xl text-xl text-muted">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-5 lg:gap-24">
          <div className="space-y-10 lg:col-span-2">
            <div className="flex flex-col gap-8 rounded-3xl border border-border bg-card p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  📍
                </div>
                <div>
                  <h2 className="mb-1 text-lg font-bold text-foreground">
                    {t("contact.address")}
                  </h2>
                  <p className="text-lg text-muted">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  ✉️
                </div>
                <div>
                  <h2 className="mb-1 text-lg font-bold text-foreground">
                    {t("contact.email")}
                  </h2>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-lg text-muted transition-colors hover:text-primary"
                  >
                    {settings.contact_email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  📞
                </div>
                <div>
                  <h2 className="mb-1 text-lg font-bold text-foreground">
                    {t("contact.phone")}
                  </h2>
                  <a
                    href={`tel:${settings.contact_phone}`}
                    className="text-lg text-muted transition-colors hover:text-primary"
                    dir="ltr"
                  >
                    {settings.contact_phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm md:p-12">
              <h2 className="mb-8 text-2xl font-bold">{t("contact.formTitle")}</h2>
              <form className="space-y-6" onSubmit={onSubmit}>
                <div>
                  <label className="mb-2 block text-base font-medium">{t("contact.nameLabel")}</label>
                  <input
                    className="h-12 w-full rounded-lg border border-border bg-background px-3 py-2"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-base font-medium">{t("contact.emailLabel")}</label>
                  <input
                    type="email"
                    className="h-12 w-full rounded-lg border border-border bg-background px-3 py-2"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-base font-medium">
                    {t("contact.messageLabel")}
                  </label>
                  <textarea
                    rows={6}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    value={form.message}
                    onChange={(event) => updateField("message", event.target.value)}
                    required
                  />
                </div>
                <button
                  className="h-14 w-full rounded-lg bg-primary px-4 text-lg font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? t("contact.submitting") : t("contact.submit")}
                </button>
                {status === "success" ? (
                  <p className="text-sm font-semibold text-primary">{t("contact.success")}</p>
                ) : null}
                {status === "error" ? (
                  <p className="text-sm font-semibold text-red-700">{t("contact.error")}</p>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

