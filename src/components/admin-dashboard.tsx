"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLanguage, useSiteSettings } from "@/components/app-providers";
import { apiRequest } from "@/lib/api-client";
import type { AdminStats, Inquiry, Product, ProductInput, SiteSettings } from "@/lib/types";

type Tab = "stats" | "products" | "inquiries" | "settings";

type ProductFormState = {
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: string;
  unit_en: string;
  unit_ar: string;
  image_url: string;
  category_en: string;
  category_ar: string;
  in_stock: boolean;
};

const blankProduct: ProductFormState = {
  slug: "",
  name_en: "",
  name_ar: "",
  description_en: "",
  description_ar: "",
  price: "0",
  unit_en: "",
  unit_ar: "",
  image_url: "/products/bowl-24oz.png",
  category_en: "",
  category_ar: "",
  in_stock: true,
};

function productToForm(product: Product): ProductFormState {
  return {
    slug: product.slug,
    name_en: product.name_en,
    name_ar: product.name_ar,
    description_en: product.description_en,
    description_ar: product.description_ar,
    price: String(product.price),
    unit_en: product.unit_en,
    unit_ar: product.unit_ar,
    image_url: product.image_url,
    category_en: product.category_en,
    category_ar: product.category_ar,
    in_stock: product.in_stock,
  };
}

function formToProductInput(form: ProductFormState): ProductInput {
  return {
    slug: form.slug,
    name_en: form.name_en,
    name_ar: form.name_ar,
    description_en: form.description_en,
    description_ar: form.description_ar,
    price: Number(form.price),
    unit_en: form.unit_en,
    unit_ar: form.unit_ar,
    image_url: form.image_url,
    category_en: form.category_en,
    category_ar: form.category_ar,
    in_stock: form.in_stock,
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function AdminDashboard() {
  const { t } = useLanguage();
  const { refreshSettings } = useSiteSettings();
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(blankProduct);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const statCards = useMemo(
    () => [
      { label: t("admin.totalProducts"), value: stats?.total_products ?? 0 },
      { label: t("admin.inStock"), value: stats?.in_stock_products ?? 0 },
      { label: t("admin.totalInquiries"), value: stats?.total_inquiries ?? 0 },
      { label: t("admin.unresolvedInquiries"), value: stats?.unresolved_inquiries ?? 0 },
    ],
    [stats, t],
  );

  const loadAll = async () => {
    setLoading(true);
    try {
      const [nextStats, nextProducts, nextInquiries, nextSettings] = await Promise.all([
        apiRequest<AdminStats>("/api/admin/stats"),
        apiRequest<Product[]>("/api/products"),
        apiRequest<Inquiry[]>("/api/inquiries"),
        apiRequest<SiteSettings>("/api/settings"),
      ]);
      setStats(nextStats);
      setProducts(nextProducts);
      setInquiries(nextInquiries);
      setSettings(nextSettings);
      setError(null);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = window.setTimeout(() => void loadAll(), 0);
    return () => window.clearTimeout(id);
  }, []);

  const updateProductForm = (field: keyof ProductFormState, value: string | boolean) => {
    setProductForm((current) => ({ ...current, [field]: value }));
  };

  const startEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm(productToForm(product));
    setTab("products");
    setNotice(null);
    setError(null);
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(blankProduct);
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    setError(null);
    try {
      const payload = formToProductInput(productForm);
      if (editingProductId) {
        await apiRequest<Product>(`/api/products/${editingProductId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setNotice("Product updated.");
      } else {
        await apiRequest<Product>("/api/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setNotice("Product created.");
      }
      resetProductForm();
      await loadAll();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unable to save product");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name_en}?`)) return;
    setSaving(true);
    setNotice(null);
    setError(null);
    try {
      await apiRequest<void>(`/api/products/${product.id}`, { method: "DELETE" });
      setNotice("Product deleted.");
      if (editingProductId === product.id) resetProductForm();
      await loadAll();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unable to delete product");
    } finally {
      setSaving(false);
    }
  };

  const saveInquiry = async (inquiry: Inquiry, resolved: boolean, reply: string) => {
    setSaving(true);
    setNotice(null);
    setError(null);
    try {
      await apiRequest<Inquiry>(`/api/inquiries/${inquiry.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          resolved,
          reply: reply.trim().length > 0 ? reply : null,
        }),
      });
      setNotice("Inquiry updated.");
      await loadAll();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unable to update inquiry");
    } finally {
      setSaving(false);
    }
  };

  const updateSettingsField = (field: keyof SiteSettings, value: string) => {
    setSettings((current) => (current ? { ...current, [field]: value } : current));
  };

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings) return;
    setSaving(true);
    setNotice(null);
    setError(null);
    try {
      const updated = await apiRequest<SiteSettings>("/api/settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      setSettings(updated);
      await refreshSettings();
      setNotice("Settings updated.");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unable to update settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "stats", label: t("admin.stats") },
    { id: "products", label: t("admin.products") },
    { id: "inquiries", label: t("admin.inquiries") },
    { id: "settings", label: t("admin.settings") },
  ];

  return (
    <section className="container py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-bold text-foreground">{t("admin.title")}</h1>
        <button
          type="button"
          onClick={() => void loadAll()}
          className="rounded-lg border border-border px-4 py-2 font-semibold hover:bg-card"
        >
          Refresh
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-lg border px-4 py-2 font-semibold ${
              tab === item.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {notice ? (
        <p className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4 text-primary">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
        </p>
      ) : null}
      {loading ? (
        <p className="rounded-xl border border-border bg-card p-6 text-muted">Loading...</p>
      ) : null}

      {!loading && tab === "stats" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <article key={card.label} className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-muted">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-primary">{card.value}</p>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && tab === "products" ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-border/70">
                      <td className="px-4 py-3 font-semibold">{product.name_en}</td>
                      <td className="px-4 py-3 text-muted">{product.category_en}</td>
                      <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        {product.in_stock ? t("products.inStock") : t("products.outOfStock")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditProduct(product)}
                            className="rounded border border-border px-3 py-1 hover:bg-background"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteProduct(product)}
                            disabled={saving}
                            className="rounded border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <form onSubmit={saveProduct} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-5 text-xl font-bold">
              {editingProductId ? t("admin.editProduct") : t("admin.createProduct")}
            </h2>
            <div className="grid gap-4">
              <Field label="Slug">
                <input className="rounded-lg border border-border bg-background px-3 py-2" value={productForm.slug} onChange={(event) => updateProductForm("slug", event.target.value)} required />
              </Field>
              <Field label="Name EN">
                <input className="rounded-lg border border-border bg-background px-3 py-2" value={productForm.name_en} onChange={(event) => updateProductForm("name_en", event.target.value)} required />
              </Field>
              <Field label="Name AR">
                <input className="rounded-lg border border-border bg-background px-3 py-2" value={productForm.name_ar} onChange={(event) => updateProductForm("name_ar", event.target.value)} required dir="rtl" />
              </Field>
              <Field label="Description EN">
                <textarea className="rounded-lg border border-border bg-background px-3 py-2" rows={3} value={productForm.description_en} onChange={(event) => updateProductForm("description_en", event.target.value)} required />
              </Field>
              <Field label="Description AR">
                <textarea className="rounded-lg border border-border bg-background px-3 py-2" rows={3} value={productForm.description_ar} onChange={(event) => updateProductForm("description_ar", event.target.value)} required dir="rtl" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price">
                  <input className="rounded-lg border border-border bg-background px-3 py-2" type="number" min="0" step="0.01" value={productForm.price} onChange={(event) => updateProductForm("price", event.target.value)} required />
                </Field>
                <Field label="Image URL">
                  <input className="rounded-lg border border-border bg-background px-3 py-2" value={productForm.image_url} onChange={(event) => updateProductForm("image_url", event.target.value)} required />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Unit EN">
                  <input className="rounded-lg border border-border bg-background px-3 py-2" value={productForm.unit_en} onChange={(event) => updateProductForm("unit_en", event.target.value)} required />
                </Field>
                <Field label="Unit AR">
                  <input className="rounded-lg border border-border bg-background px-3 py-2" value={productForm.unit_ar} onChange={(event) => updateProductForm("unit_ar", event.target.value)} required dir="rtl" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category EN">
                  <input className="rounded-lg border border-border bg-background px-3 py-2" value={productForm.category_en} onChange={(event) => updateProductForm("category_en", event.target.value)} required />
                </Field>
                <Field label="Category AR">
                  <input className="rounded-lg border border-border bg-background px-3 py-2" value={productForm.category_ar} onChange={(event) => updateProductForm("category_ar", event.target.value)} required dir="rtl" />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={productForm.in_stock} onChange={(event) => updateProductForm("in_stock", event.target.checked)} />
                {t("products.inStock")}
              </label>
              <div className="flex gap-3">
                <button className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60" disabled={saving}>
                  {t("admin.save")}
                </button>
                {editingProductId ? (
                  <button type="button" onClick={resetProductForm} className="rounded-lg border border-border px-4 py-2 font-semibold">
                    {t("admin.cancel")}
                  </button>
                ) : null}
              </div>
            </div>
          </form>
        </div>
      ) : null}

      {!loading && tab === "inquiries" ? (
        <div className="grid gap-5">
          {inquiries.map((inquiry) => (
            <InquiryEditor
              key={`${inquiry.id}-${inquiry.resolved}-${inquiry.reply ?? ""}`}
              inquiry={inquiry}
              saving={saving}
              onSave={saveInquiry}
            />
          ))}
        </div>
      ) : null}

      {!loading && tab === "settings" && settings ? (
        <form onSubmit={saveSettings} className="max-w-3xl rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-5 text-xl font-bold">{t("admin.settings")}</h2>
          <div className="grid gap-4">
            {Object.entries(settings).map(([key, value]) => (
              <Field key={key} label={key}>
                {key.includes("tagline") ? (
                  <textarea
                    className="rounded-lg border border-border bg-background px-3 py-2"
                    rows={2}
                    value={value}
                    onChange={(event) => updateSettingsField(key as keyof SiteSettings, event.target.value)}
                    dir={key.endsWith("_ar") ? "rtl" : "ltr"}
                    required
                  />
                ) : (
                  <input
                    className="rounded-lg border border-border bg-background px-3 py-2"
                    value={value}
                    onChange={(event) => updateSettingsField(key as keyof SiteSettings, event.target.value)}
                    dir={key.endsWith("_ar") ? "rtl" : "ltr"}
                    required
                  />
                )}
              </Field>
            ))}
            <button className="w-fit rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60" disabled={saving}>
              {t("admin.save")}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

function InquiryEditor({
  inquiry,
  saving,
  onSave,
}: {
  inquiry: Inquiry;
  saving: boolean;
  onSave: (inquiry: Inquiry, resolved: boolean, reply: string) => Promise<void>;
}) {
  const [resolved, setResolved] = useState(inquiry.resolved);
  const [reply, setReply] = useState(inquiry.reply ?? "");
  const createdAt = new Date(inquiry.created_at).toLocaleString();

  return (
    <article className={`rounded-2xl border border-border bg-card p-6 ${resolved ? "opacity-70" : ""}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">{inquiry.name}</h3>
          <a href={`mailto:${inquiry.email}`} className="text-sm text-primary hover:underline">
            {inquiry.email}
          </a>
          <p className="mt-1 text-xs text-muted">
            {createdAt}
            {inquiry.page ? ` · ${inquiry.page}` : ""}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={resolved}
            onChange={(event) => setResolved(event.target.checked)}
          />
          Resolved
        </label>
      </div>

      <p className="mb-4 rounded-xl border-l-4 border-primary/40 bg-background p-4 text-sm">
        {inquiry.message}
      </p>

      <label className="grid gap-2 text-sm font-medium">
        Reply
        <textarea
          rows={3}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2"
        />
      </label>

      <button
        type="button"
        onClick={() => void onSave(inquiry, resolved, reply)}
        disabled={saving}
        className="mt-4 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60"
      >
        Save inquiry
      </button>
    </article>
  );
}

