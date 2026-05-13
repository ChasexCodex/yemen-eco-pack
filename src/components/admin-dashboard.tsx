"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Trash2, Upload, X } from "lucide-react";
import { useLanguage, useSiteSettings } from "@/components/app-providers";
import { apiRequest } from "@/lib/api-client";
import { Skeleton } from "@/components/skeleton";
import { useApiSWR } from "@/lib/swr";
import type { AdminStats, Inquiry, MaterialPageItem, Product, ProductInput, SiteSettings } from "@/lib/types";

type Tab = "stats" | "products" | "inquiries" | "settings" | "pages";
type UploadField = "product-image" | "logo-image" | "hero-image-new" | `hero-image-${number}`;

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
  stock_amount: string;
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
  stock_amount: "1",
};

const inputClassName = "w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2";
const textareaClassName = `${inputClassName} resize-y`;

type UploadImageResponse = {
  path: string;
  url: string;
};

type PageContentState = SiteSettings["page_content"];

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
    stock_amount: String(product.stock_amount),
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
    stock_amount: Number(form.stock_amount),
    in_stock: Number(form.stock_amount) > 0,
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
    <label className="grid min-w-0 gap-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ImageInput({
  label,
  value,
  disabled,
  uploading,
  onChange,
  onUpload,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  uploading: boolean;
  onChange: (value: string) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
}) {
  return (
    <Field label={label}>
      <div className="grid gap-3">
        <input
          className={inputClassName}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          disabled={disabled}
        />
        <label className="grid gap-2 text-xs font-medium text-muted">
          <span>{uploading ? "Uploading image..." : "Upload image from storage"}</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              void onUpload(event);
            }}
            disabled={disabled || uploading}
            className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:font-semibold file:text-primary-foreground hover:file:opacity-90"
          />
        </label>
        {value ? (
          <div className="overflow-hidden rounded-xl border border-border bg-white p-3">
            <Image
              src={value}
              alt={`${label} preview`}
              width={640}
              height={320}
              unoptimized
              className="h-32 w-full object-contain"
            />
          </div>
        ) : null}
      </div>
    </Field>
  );
}

export function AdminDashboard() {
  const { t } = useLanguage();
  const { refreshSettings } = useSiteSettings();
  const [tab, setTab] = useState<Tab>("stats");
  const {
    data: stats,
    mutate: mutateStats,
    isLoading: statsLoading,
    error: statsError,
  } = useApiSWR<AdminStats>("/api/admin/stats");
  const { data: products = [], mutate: mutateProducts, isLoading: productsLoading, error: productsError } =
    useApiSWR<Product[]>("/api/products");
  const { data: inquiries = [], mutate: mutateInquiries, isLoading: inquiriesLoading, error: inquiriesError } =
    useApiSWR<Inquiry[]>("/api/inquiries");
  const {
    data: settingsData,
    mutate: mutateSettings,
    isLoading: settingsLoading,
    error: settingsError,
  } = useApiSWR<SiteSettings>("/api/settings");
  const [productForm, setProductForm] = useState<ProductFormState>(blankProduct);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [settingsForm, setSettingsForm] = useState<SiteSettings | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<UploadField | null>(null);
  const [newHeroImageUrl, setNewHeroImageUrl] = useState("");
  const loading = statsLoading || productsLoading || inquiriesLoading || settingsLoading;
  const loadError = statsError ?? productsError ?? inquiriesError ?? settingsError;

  const statCards = useMemo(
    () => [
      { label: t("admin.totalProducts"), value: stats?.total_products ?? 0 },
      { label: t("admin.inStock"), value: stats?.in_stock_products ?? 0 },
      { label: t("admin.totalInquiries"), value: stats?.total_inquiries ?? 0 },
      { label: t("admin.unresolvedInquiries"), value: stats?.unresolved_inquiries ?? 0 },
    ],
    [stats, t],
  );

  const refreshAll = async () => {
    await Promise.all([
      mutateStats(),
      mutateProducts(),
      mutateInquiries(),
      mutateSettings(),
      refreshSettings(),
    ]);
  };

  const updateProductForm = (field: keyof ProductFormState, value: string) => {
    setProductForm((current) => ({ ...current, [field]: value }));
  };

  const uploadImage = async ({
    file,
    field,
    folder,
    onUploaded,
  }: {
    file: File;
    field: UploadField;
    folder: "products" | "settings";
    onUploaded: (url: string) => void;
  }) => {
    setUploadingField(field);
    setNotice(null);
    setActionError(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", folder);

      const result = await apiRequest<UploadImageResponse>("/api/admin/storage/upload", {
        method: "POST",
        body: formData,
      });

      onUploaded(result.url);
      setNotice("Image uploaded. Save changes to apply it.");
    } catch (caught: unknown) {
      setActionError(caught instanceof Error ? caught.message : "Unable to upload image");
    } finally {
      setUploadingField(null);
    }
  };

  const handleProductImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    await uploadImage({
      file,
      field: "product-image",
      folder: "products",
      onUploaded: (url) => updateProductForm("image_url", url),
    });
  };

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    await uploadImage({
      file,
      field: "logo-image",
      folder: "settings",
      onUploaded: (url) => updateSettingsField("logo_url", url),
    });
  };

  const handleHeroImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    index?: number,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (index === undefined && heroImages.length >= 5) {
      setActionError("You can only keep up to 5 hero images.");
      return;
    }

    await uploadImage({
      file,
      field: index === undefined ? "hero-image-new" : `hero-image-${index}`,
      folder: "settings",
      onUploaded: (url) => {
        if (index === undefined) {
          appendHeroImage(url);
        } else {
          updateHeroImage(index, url);
        }
      },
    });
  };

  const startEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm(productToForm(product));
    setTab("products");
    setNotice(null);
    setActionError(null);
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(blankProduct);
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    setActionError(null);
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
      await Promise.all([mutateProducts(), mutateStats()]);
    } catch (caught: unknown) {
      setActionError(caught instanceof Error ? caught.message : "Unable to save product");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name_en}?`)) return;
    setSaving(true);
    setNotice(null);
    setActionError(null);
    try {
      await apiRequest<void>(`/api/products/${product.id}`, { method: "DELETE" });
      setNotice("Product deleted.");
      if (editingProductId === product.id) resetProductForm();
      await Promise.all([mutateProducts(), mutateStats()]);
    } catch (caught: unknown) {
      setActionError(caught instanceof Error ? caught.message : "Unable to delete product");
    } finally {
      setSaving(false);
    }
  };

  const saveInquiry = async (inquiry: Inquiry, resolved: boolean, reply: string) => {
    setSaving(true);
    setNotice(null);
    setActionError(null);
    try {
      await apiRequest<Inquiry>(`/api/inquiries/${inquiry.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          resolved,
          reply: reply.trim().length > 0 ? reply : null,
        }),
      });
      setNotice("Inquiry updated.");
      await Promise.all([mutateInquiries(), mutateStats()]);
    } catch (caught: unknown) {
      setActionError(caught instanceof Error ? caught.message : "Unable to update inquiry");
    } finally {
      setSaving(false);
    }
  };

  const updateSettingsField = <K extends keyof SiteSettings>(
    field: K,
    value: SiteSettings[K],
  ) => {
    setSettingsForm((current) => ({
      ...(current ?? settingsData ?? {}),
      [field]: value,
    }) as SiteSettings);
  };

  const currentSettings = settingsForm ?? settingsData ?? null;
  const heroImages = currentSettings?.hero_images ?? [];
  const pageContent = currentSettings?.page_content ?? null;
  const materialItems = pageContent?.materials.items ?? [];

  const updateHeroImage = (index: number, value: string) => {
    updateSettingsField(
      "hero_images",
      heroImages.map((image, imageIndex) => (imageIndex === index ? value : image)),
    );
  };

  const removeHeroImage = (index: number) => {
    updateSettingsField(
      "hero_images",
      heroImages.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const appendHeroImage = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) {
      setActionError("Hero image URL cannot be empty.");
      return;
    }
    if (heroImages.length >= 5) {
      setActionError("You can only keep up to 5 hero images.");
      return;
    }
    updateSettingsField("hero_images", [...heroImages, trimmed]);
    setNewHeroImageUrl("");
    setActionError(null);
  };

  const updatePageSection = <K extends keyof PageContentState>(
    section: K,
    value: PageContentState[K],
  ) => {
    if (!pageContent) return;
    updateSettingsField("page_content", {
      ...pageContent,
      [section]: value,
    } as PageContentState);
  };

  const updatePageField = <
    K extends keyof PageContentState,
    F extends keyof PageContentState[K],
  >(
    section: K,
    field: F,
    value: PageContentState[K][F],
  ) => {
    if (!pageContent) return;
    updatePageSection(section, {
      ...pageContent[section],
      [field]: value,
    } as PageContentState[K]);
  };

  const updateMaterialItemField = <K extends keyof MaterialPageItem>(
    index: number,
    field: K,
    value: MaterialPageItem[K],
  ) => {
    if (!pageContent) return;
    updatePageSection("materials", {
      ...pageContent.materials,
      items: materialItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    });
  };

  const addMaterialItem = () => {
    if (!pageContent) return;
    const nextMaterialId =
      materialItems.reduce((maxId, item) => {
        const match = item.id.match(/^material-(\d+)$/);
        const candidate = match ? Number(match[1]) : 0;
        return candidate > maxId ? candidate : maxId;
      }, 0) + 1;

    updatePageSection("materials", {
      ...pageContent.materials,
      items: [
        ...materialItems,
        {
          id: `material-${nextMaterialId}`,
          title_en: "New material",
          title_ar: "مادة جديدة",
          what_en: "Describe what this material is.",
          what_ar: "اشرح ما هي هذه المادة.",
          benefits_en: "Describe the key benefits of this material.",
          benefits_ar: "اشرح الفوائد الرئيسية لهذه المادة.",
          links: [],
        },
      ],
    });
  };

  const removeMaterialItem = (index: number) => {
    if (!pageContent) return;
    updatePageSection("materials", {
      ...pageContent.materials,
      items: materialItems.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const updateMaterialLink = (
    itemIndex: number,
    linkIndex: number,
    field: "title" | "url",
    value: string,
  ) => {
    if (!pageContent) return;
    updatePageSection("materials", {
      ...pageContent.materials,
      items: materialItems.map((item, currentItemIndex) =>
        currentItemIndex === itemIndex
          ? {
              ...item,
              links: item.links.map((link, currentLinkIndex) =>
                currentLinkIndex === linkIndex ? { ...link, [field]: value } : link,
              ),
            }
          : item,
      ),
    });
  };

  const addMaterialLink = (itemIndex: number) => {
    if (!pageContent) return;
    updatePageSection("materials", {
      ...pageContent.materials,
      items: materialItems.map((item, currentItemIndex) =>
        currentItemIndex === itemIndex
          ? {
              ...item,
              links: [...item.links, { title: "Reference title", url: "https://example.com" }],
            }
          : item,
      ),
    });
  };

  const removeMaterialLink = (itemIndex: number, linkIndex: number) => {
    if (!pageContent) return;
    updatePageSection("materials", {
      ...pageContent.materials,
      items: materialItems.map((item, currentItemIndex) =>
        currentItemIndex === itemIndex
          ? {
              ...item,
              links: item.links.filter((_, currentLinkIndex) => currentLinkIndex !== linkIndex),
            }
          : item,
      ),
    });
  };

  const persistSettings = async (successMessage: string) => {
    const nextSettings = settingsForm ?? settingsData;
    if (!nextSettings) return;
    setSaving(true);
    setNotice(null);
    setActionError(null);
    try {
      const updated = await apiRequest<SiteSettings>("/api/settings", {
        method: "PATCH",
        body: JSON.stringify(nextSettings),
      });
      setSettingsForm(updated);
      await mutateSettings(updated, { revalidate: false });
      await refreshSettings();
      setNotice(successMessage);
    } catch (caught: unknown) {
      setActionError(caught instanceof Error ? caught.message : "Unable to update settings");
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await persistSettings("Settings updated.");
  };

  const savePages = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await persistSettings("Pages updated.");
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "stats", label: t("admin.stats") },
    { id: "products", label: t("admin.products") },
    { id: "inquiries", label: t("admin.inquiries") },
    { id: "settings", label: t("admin.settings") },
    { id: "pages", label: t("admin.pages") },
  ];

  return (
    <section className="container py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-bold text-foreground">{t("admin.title")}</h1>
        <button
          type="button"
          onClick={() => void refreshAll()}
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
      {actionError ? (
        <p className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
          {actionError}
        </p>
      ) : null}
      {loadError ? (
        <p className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
          {loadError.message}
        </p>
      ) : null}

      {tab === "stats" ? (
        loading ? (
          <StatsSkeleton />
        ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <article key={card.label} className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-muted">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-primary">{card.value}</p>
            </article>
          ))}
        </div>
        )
      ) : null}

      {tab === "products" ? (
        loading ? (
          <ProductsTabSkeleton />
        ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <table className="w-full table-fixed text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="w-[36%] px-4 py-3">Product</th>
                    <th className="w-[22%] px-4 py-3">Category</th>
                    <th className="w-[11%] px-4 py-3">Price</th>
                    <th className="w-[10%] px-4 py-3">Stock</th>
                    <th className="w-[15%] px-4 py-3">Status</th>
                    <th className="w-[16%] px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-border/70">
                       <td className="px-4 py-3 font-semibold break-words">{product.name_en}</td>
                       <td className="px-4 py-3 break-words text-muted">{product.category_en}</td>
                       <td className="whitespace-nowrap px-4 py-3">${product.price.toFixed(2)}</td>
                       <td className="whitespace-nowrap px-4 py-3">{product.stock_amount}</td>
                       <td className="whitespace-nowrap px-4 py-3">
                         {product.in_stock ? t("products.inStock") : t("products.outOfStock")}
                       </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="inline-flex items-center gap-2 whitespace-nowrap">
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
                            aria-label={`Delete ${product.name_en}`}
                            title={`Delete ${product.name_en}`}
                            className="rounded border border-red-300 p-2 text-red-700 hover:bg-red-50 disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>

          <form onSubmit={saveProduct} className="min-w-0 rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-5 text-xl font-bold">
              {editingProductId ? t("admin.editProduct") : t("admin.createProduct")}
            </h2>
            <div className="grid gap-4">
              <Field label="Slug">
                <input className={inputClassName} value={productForm.slug} onChange={(event) => updateProductForm("slug", event.target.value)} required />
              </Field>
              <Field label="Name EN">
                <input className={inputClassName} value={productForm.name_en} onChange={(event) => updateProductForm("name_en", event.target.value)} required />
              </Field>
              <Field label="Name AR">
                <input className={inputClassName} value={productForm.name_ar} onChange={(event) => updateProductForm("name_ar", event.target.value)} required dir="rtl" />
              </Field>
              <Field label="Description EN">
                <textarea className={textareaClassName} rows={3} value={productForm.description_en} onChange={(event) => updateProductForm("description_en", event.target.value)} required />
              </Field>
              <Field label="Description AR">
                <textarea className={textareaClassName} rows={3} value={productForm.description_ar} onChange={(event) => updateProductForm("description_ar", event.target.value)} required dir="rtl" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price">
                  <input className={inputClassName} type="number" min="0" step="0.01" value={productForm.price} onChange={(event) => updateProductForm("price", event.target.value)} required />
                </Field>
                <Field label="Stock amount">
                  <input
                    className={inputClassName}
                    type="number"
                    min="0"
                    step="1"
                    value={productForm.stock_amount}
                    onChange={(event) => updateProductForm("stock_amount", event.target.value)}
                    required
                  />
                </Field>
              </div>
              <p className="text-sm text-muted">
                Product availability updates automatically from the stock amount.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <ImageInput
                  label="Image URL"
                  value={productForm.image_url}
                  onChange={(value) => updateProductForm("image_url", value)}
                  onUpload={handleProductImageUpload}
                  uploading={uploadingField === "product-image"}
                  disabled={saving}
                />
                <Field label="Unit EN">
                  <input className={inputClassName} value={productForm.unit_en} onChange={(event) => updateProductForm("unit_en", event.target.value)} required />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Unit AR">
                  <input className={inputClassName} value={productForm.unit_ar} onChange={(event) => updateProductForm("unit_ar", event.target.value)} required dir="rtl" />
                </Field>
                <Field label="Category EN">
                  <input className={inputClassName} value={productForm.category_en} onChange={(event) => updateProductForm("category_en", event.target.value)} required />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category AR">
                  <input className={inputClassName} value={productForm.category_ar} onChange={(event) => updateProductForm("category_ar", event.target.value)} required dir="rtl" />
                </Field>
              </div>
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
        )
      ) : null}

      {tab === "inquiries" ? (
        loading ? (
          <InquiriesSkeleton />
        ) : (
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
        )
      ) : null}

      {tab === "settings" ? (
        loading || !(settingsForm ?? settingsData) ? (
          <SettingsSkeleton />
        ) : (
        <form onSubmit={saveSettings} className="max-w-4xl rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-5 text-xl font-bold">{t("admin.settings")}</h2>
            <div className="grid gap-4">
            {currentSettings ? (
              <>
                  <ImageInput
                  label="logo_url"
                  value={currentSettings.logo_url}
                  onChange={(nextValue) => updateSettingsField("logo_url", nextValue)}
                  onUpload={handleLogoUpload}
                  uploading={uploadingField === "logo-image"}
                  disabled={saving}
                />
                <div className="grid gap-4 rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold">hero_images</h3>
                      <p className="text-sm text-muted">
                        Up to 5 images. These are used in the homepage hero carousel.
                      </p>
                    </div>
                    <span className="text-sm text-muted">{heroImages.length}/5</span>
                  </div>

                  {heroImages.length > 0 ? (
                    <div className="grid gap-4">
                      {heroImages.map((image, index) => (
                        <div key={`${image}-${index}`} className="grid gap-3 rounded-xl border border-border p-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium">Hero image {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeHeroImage(index)}
                              className="rounded border border-red-300 p-2 text-red-700 hover:bg-red-50"
                              aria-label={`Remove hero image ${index + 1}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <ImageInput
                            label={`hero_image_${index + 1}`}
                            value={image}
                            onChange={(nextValue) => updateHeroImage(index, nextValue)}
                            onUpload={(event) => handleHeroImageUpload(event, index)}
                            uploading={uploadingField === `hero-image-${index}`}
                            disabled={saving}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">
                      No hero images configured. Add one below to replace the current fallback image.
                    </p>
                  )}

                  {heroImages.length < 5 ? (
                    <div className="grid gap-3 rounded-xl border border-dashed border-border p-4">
                      <Field label="Add hero image URL">
                        <div className="flex gap-2">
                          <input
                            className={inputClassName}
                            value={newHeroImageUrl}
                            onChange={(event) => setNewHeroImageUrl(event.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => appendHeroImage(newHeroImageUrl)}
                            className="rounded-lg border border-border px-4 py-2 font-semibold hover:bg-background"
                          >
                            Add
                          </button>
                        </div>
                      </Field>
                      <label className="inline-flex w-fit items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-background">
                        <Upload className="h-4 w-4" />
                        <span>
                          {uploadingField === "hero-image-new"
                            ? "Uploading hero image..."
                            : "Upload hero image from storage"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            void handleHeroImageUpload(event);
                          }}
                          disabled={saving || uploadingField === "hero-image-new"}
                        />
                      </label>
                    </div>
                  ) : null}
                </div>

                <Field label="contact_email">
                  <input
                    className={inputClassName}
                    value={currentSettings.contact_email}
                    onChange={(event) => updateSettingsField("contact_email", event.target.value)}
                    required
                  />
                </Field>
                <Field label="contact_phone">
                  <input
                    className={inputClassName}
                    value={currentSettings.contact_phone}
                    onChange={(event) => updateSettingsField("contact_phone", event.target.value)}
                    required
                  />
                </Field>
                <Field label="address_en">
                  <input
                    className={inputClassName}
                    value={currentSettings.address_en}
                    onChange={(event) => updateSettingsField("address_en", event.target.value)}
                    required
                  />
                </Field>
                <Field label="address_ar">
                  <input
                    className={inputClassName}
                    value={currentSettings.address_ar}
                    onChange={(event) => updateSettingsField("address_ar", event.target.value)}
                    dir="rtl"
                    required
                  />
                </Field>
                <Field label="tagline_en">
                  <textarea
                    className={textareaClassName}
                    rows={2}
                    value={currentSettings.tagline_en}
                    onChange={(event) => updateSettingsField("tagline_en", event.target.value)}
                    required
                  />
                </Field>
                <Field label="tagline_ar">
                  <textarea
                    className={textareaClassName}
                    rows={2}
                    value={currentSettings.tagline_ar}
                    onChange={(event) => updateSettingsField("tagline_ar", event.target.value)}
                    dir="rtl"
                    required
                  />
                </Field>
              </>
            ) : null}
            <button className="w-fit rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60" disabled={saving}>
              {t("admin.save")}
            </button>
          </div>
        </form>
        )
      ) : null}

      {tab === "pages" ? (
        loading || !pageContent ? (
          <SettingsSkeleton />
        ) : (
          <form onSubmit={savePages} className="max-w-5xl rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-5 text-xl font-bold">{t("admin.pages")}</h2>
            <div className="grid gap-6">
              <section className="rounded-2xl border border-border p-5">
                <h3 className="mb-4 text-lg font-semibold">Home page</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="hero_title_en">
                    <textarea className={textareaClassName} rows={2} value={pageContent.home.hero_title_en} onChange={(event) => updatePageField("home", "hero_title_en", event.target.value)} />
                  </Field>
                  <Field label="hero_title_ar">
                    <textarea className={textareaClassName} rows={2} dir="rtl" value={pageContent.home.hero_title_ar} onChange={(event) => updatePageField("home", "hero_title_ar", event.target.value)} />
                  </Field>
                  <Field label="hero_subtitle_en">
                    <textarea className={textareaClassName} rows={3} value={pageContent.home.hero_subtitle_en} onChange={(event) => updatePageField("home", "hero_subtitle_en", event.target.value)} />
                  </Field>
                  <Field label="hero_subtitle_ar">
                    <textarea className={textareaClassName} rows={3} dir="rtl" value={pageContent.home.hero_subtitle_ar} onChange={(event) => updatePageField("home", "hero_subtitle_ar", event.target.value)} />
                  </Field>
                  <Field label="cta_label_en">
                    <input className={inputClassName} value={pageContent.home.cta_label_en} onChange={(event) => updatePageField("home", "cta_label_en", event.target.value)} />
                  </Field>
                  <Field label="cta_label_ar">
                    <input className={inputClassName} dir="rtl" value={pageContent.home.cta_label_ar} onChange={(event) => updatePageField("home", "cta_label_ar", event.target.value)} />
                  </Field>
                  <Field label="featured_title_en">
                    <input className={inputClassName} value={pageContent.home.featured_title_en} onChange={(event) => updatePageField("home", "featured_title_en", event.target.value)} />
                  </Field>
                  <Field label="featured_title_ar">
                    <input className={inputClassName} dir="rtl" value={pageContent.home.featured_title_ar} onChange={(event) => updatePageField("home", "featured_title_ar", event.target.value)} />
                  </Field>
                  <Field label="featured_link_label_en">
                    <input className={inputClassName} value={pageContent.home.featured_link_label_en} onChange={(event) => updatePageField("home", "featured_link_label_en", event.target.value)} />
                  </Field>
                  <Field label="featured_link_label_ar">
                    <input className={inputClassName} dir="rtl" value={pageContent.home.featured_link_label_ar} onChange={(event) => updatePageField("home", "featured_link_label_ar", event.target.value)} />
                  </Field>
                  <Field label="why_title_en">
                    <input className={inputClassName} value={pageContent.home.why_title_en} onChange={(event) => updatePageField("home", "why_title_en", event.target.value)} />
                  </Field>
                  <Field label="why_title_ar">
                    <input className={inputClassName} dir="rtl" value={pageContent.home.why_title_ar} onChange={(event) => updatePageField("home", "why_title_ar", event.target.value)} />
                  </Field>
                  <Field label="why_text_en">
                    <textarea className={textareaClassName} rows={4} value={pageContent.home.why_text_en} onChange={(event) => updatePageField("home", "why_text_en", event.target.value)} />
                  </Field>
                  <Field label="why_text_ar">
                    <textarea className={textareaClassName} rows={4} dir="rtl" value={pageContent.home.why_text_ar} onChange={(event) => updatePageField("home", "why_text_ar", event.target.value)} />
                  </Field>
                  <Field label="materials_link_label_en">
                    <input className={inputClassName} value={pageContent.home.materials_link_label_en} onChange={(event) => updatePageField("home", "materials_link_label_en", event.target.value)} />
                  </Field>
                  <Field label="materials_link_label_ar">
                    <input className={inputClassName} dir="rtl" value={pageContent.home.materials_link_label_ar} onChange={(event) => updatePageField("home", "materials_link_label_ar", event.target.value)} />
                  </Field>
                </div>
              </section>

              <section className="rounded-2xl border border-border p-5">
                <h3 className="mb-4 text-lg font-semibold">Products page</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="title_en">
                    <input className={inputClassName} value={pageContent.products.title_en} onChange={(event) => updatePageField("products", "title_en", event.target.value)} />
                  </Field>
                  <Field label="title_ar">
                    <input className={inputClassName} dir="rtl" value={pageContent.products.title_ar} onChange={(event) => updatePageField("products", "title_ar", event.target.value)} />
                  </Field>
                  <Field label="subtitle_en">
                    <textarea className={textareaClassName} rows={3} value={pageContent.products.subtitle_en} onChange={(event) => updatePageField("products", "subtitle_en", event.target.value)} />
                  </Field>
                  <Field label="subtitle_ar">
                    <textarea className={textareaClassName} rows={3} dir="rtl" value={pageContent.products.subtitle_ar} onChange={(event) => updatePageField("products", "subtitle_ar", event.target.value)} />
                  </Field>
                  <Field label="empty_en">
                    <textarea className={textareaClassName} rows={2} value={pageContent.products.empty_en} onChange={(event) => updatePageField("products", "empty_en", event.target.value)} />
                  </Field>
                  <Field label="empty_ar">
                    <textarea className={textareaClassName} rows={2} dir="rtl" value={pageContent.products.empty_ar} onChange={(event) => updatePageField("products", "empty_ar", event.target.value)} />
                  </Field>
                </div>
              </section>

              <section className="rounded-2xl border border-border p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold">Materials page</h3>
                  <button type="button" onClick={addMaterialItem} className="rounded-lg border border-border px-4 py-2 font-semibold hover:bg-background">
                    Add material
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="title_en">
                    <input className={inputClassName} value={pageContent.materials.title_en} onChange={(event) => updatePageField("materials", "title_en", event.target.value)} />
                  </Field>
                  <Field label="title_ar">
                    <input className={inputClassName} dir="rtl" value={pageContent.materials.title_ar} onChange={(event) => updatePageField("materials", "title_ar", event.target.value)} />
                  </Field>
                  <Field label="subtitle_en">
                    <textarea className={textareaClassName} rows={3} value={pageContent.materials.subtitle_en} onChange={(event) => updatePageField("materials", "subtitle_en", event.target.value)} />
                  </Field>
                  <Field label="subtitle_ar">
                    <textarea className={textareaClassName} rows={3} dir="rtl" value={pageContent.materials.subtitle_ar} onChange={(event) => updatePageField("materials", "subtitle_ar", event.target.value)} />
                  </Field>
                  <Field label="references_label_en">
                    <input className={inputClassName} value={pageContent.materials.references_label_en} onChange={(event) => updatePageField("materials", "references_label_en", event.target.value)} />
                  </Field>
                  <Field label="references_label_ar">
                    <input className={inputClassName} dir="rtl" value={pageContent.materials.references_label_ar} onChange={(event) => updatePageField("materials", "references_label_ar", event.target.value)} />
                  </Field>
                </div>

                <div className="mt-6 grid gap-4">
                  {materialItems.map((item, itemIndex) => (
                    <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h4 className="font-semibold">Material {itemIndex + 1}</h4>
                        <button type="button" onClick={() => removeMaterialItem(itemIndex)} className="rounded border border-red-300 p-2 text-red-700 hover:bg-red-50">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="id">
                          <input className={inputClassName} value={item.id} onChange={(event) => updateMaterialItemField(itemIndex, "id", event.target.value)} />
                        </Field>
                        <Field label="title_en">
                          <input className={inputClassName} value={item.title_en} onChange={(event) => updateMaterialItemField(itemIndex, "title_en", event.target.value)} />
                        </Field>
                        <Field label="title_ar">
                          <input className={inputClassName} dir="rtl" value={item.title_ar} onChange={(event) => updateMaterialItemField(itemIndex, "title_ar", event.target.value)} />
                        </Field>
                        <Field label="what_en">
                          <textarea className={textareaClassName} rows={3} value={item.what_en} onChange={(event) => updateMaterialItemField(itemIndex, "what_en", event.target.value)} />
                        </Field>
                        <Field label="what_ar">
                          <textarea className={textareaClassName} rows={3} dir="rtl" value={item.what_ar} onChange={(event) => updateMaterialItemField(itemIndex, "what_ar", event.target.value)} />
                        </Field>
                        <Field label="benefits_en">
                          <textarea className={textareaClassName} rows={3} value={item.benefits_en} onChange={(event) => updateMaterialItemField(itemIndex, "benefits_en", event.target.value)} />
                        </Field>
                        <Field label="benefits_ar">
                          <textarea className={textareaClassName} rows={3} dir="rtl" value={item.benefits_ar} onChange={(event) => updateMaterialItemField(itemIndex, "benefits_ar", event.target.value)} />
                        </Field>
                      </div>

                      <div className="mt-4 rounded-xl border border-border p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h5 className="font-medium">References</h5>
                          <button type="button" onClick={() => addMaterialLink(itemIndex)} className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold hover:bg-card">
                            Add link
                          </button>
                        </div>
                        <div className="grid gap-3">
                          {item.links.map((link, linkIndex) => (
                            <div key={`${item.id}-link-${linkIndex}`} className="grid gap-3 rounded-xl border border-border p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
                              <input className={inputClassName} value={link.title} onChange={(event) => updateMaterialLink(itemIndex, linkIndex, "title", event.target.value)} />
                              <input className={inputClassName} value={link.url} onChange={(event) => updateMaterialLink(itemIndex, linkIndex, "url", event.target.value)} />
                              <button type="button" onClick={() => removeMaterialLink(itemIndex, linkIndex)} className="rounded border border-red-300 p-2 text-red-700 hover:bg-red-50">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-border p-5">
                <h3 className="mb-4 text-lg font-semibold">About page</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="title_en">
                    <input className={inputClassName} value={pageContent.about.title_en} onChange={(event) => updatePageField("about", "title_en", event.target.value)} />
                  </Field>
                  <Field label="title_ar">
                    <input className={inputClassName} dir="rtl" value={pageContent.about.title_ar} onChange={(event) => updatePageField("about", "title_ar", event.target.value)} />
                  </Field>
                  <Field label="mission_title_en">
                    <input className={inputClassName} value={pageContent.about.mission_title_en} onChange={(event) => updatePageField("about", "mission_title_en", event.target.value)} />
                  </Field>
                  <Field label="mission_title_ar">
                    <input className={inputClassName} dir="rtl" value={pageContent.about.mission_title_ar} onChange={(event) => updatePageField("about", "mission_title_ar", event.target.value)} />
                  </Field>
                  <Field label="mission_text_en">
                    <textarea className={textareaClassName} rows={4} value={pageContent.about.mission_text_en} onChange={(event) => updatePageField("about", "mission_text_en", event.target.value)} />
                  </Field>
                  <Field label="mission_text_ar">
                    <textarea className={textareaClassName} rows={4} dir="rtl" value={pageContent.about.mission_text_ar} onChange={(event) => updatePageField("about", "mission_text_ar", event.target.value)} />
                  </Field>
                  <Field label="vision_title_en">
                    <input className={inputClassName} value={pageContent.about.vision_title_en} onChange={(event) => updatePageField("about", "vision_title_en", event.target.value)} />
                  </Field>
                  <Field label="vision_title_ar">
                    <input className={inputClassName} dir="rtl" value={pageContent.about.vision_title_ar} onChange={(event) => updatePageField("about", "vision_title_ar", event.target.value)} />
                  </Field>
                  <Field label="vision_text_en">
                    <textarea className={textareaClassName} rows={4} value={pageContent.about.vision_text_en} onChange={(event) => updatePageField("about", "vision_text_en", event.target.value)} />
                  </Field>
                  <Field label="vision_text_ar">
                    <textarea className={textareaClassName} rows={4} dir="rtl" value={pageContent.about.vision_text_ar} onChange={(event) => updatePageField("about", "vision_text_ar", event.target.value)} />
                  </Field>
                </div>
              </section>

              <section className="rounded-2xl border border-border p-5">
                <h3 className="mb-4 text-lg font-semibold">Contact page</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="title_en">
                    <input className={inputClassName} value={pageContent.contact.title_en} onChange={(event) => updatePageField("contact", "title_en", event.target.value)} />
                  </Field>
                  <Field label="title_ar">
                    <input className={inputClassName} dir="rtl" value={pageContent.contact.title_ar} onChange={(event) => updatePageField("contact", "title_ar", event.target.value)} />
                  </Field>
                  <Field label="subtitle_en">
                    <textarea className={textareaClassName} rows={3} value={pageContent.contact.subtitle_en} onChange={(event) => updatePageField("contact", "subtitle_en", event.target.value)} />
                  </Field>
                  <Field label="subtitle_ar">
                    <textarea className={textareaClassName} rows={3} dir="rtl" value={pageContent.contact.subtitle_ar} onChange={(event) => updatePageField("contact", "subtitle_ar", event.target.value)} />
                  </Field>
                  <Field label="form_title_en">
                    <input className={inputClassName} value={pageContent.contact.form_title_en} onChange={(event) => updatePageField("contact", "form_title_en", event.target.value)} />
                  </Field>
                  <Field label="form_title_ar">
                    <input className={inputClassName} dir="rtl" value={pageContent.contact.form_title_ar} onChange={(event) => updatePageField("contact", "form_title_ar", event.target.value)} />
                  </Field>
                </div>
              </section>

              <button className="w-fit rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60" disabled={saving}>
                {t("admin.save")}
              </button>
            </div>
          </form>
        )
      ) : null}
    </section>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <article key={index} className="rounded-2xl border border-border bg-card p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-10 w-16" />
        </article>
      ))}
    </div>
  );
}

function ProductsTabSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-4">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <Skeleton className="mb-5 h-7 w-40" />
        <div className="grid gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="grid gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InquiriesSkeleton() {
  return (
    <div className="grid gap-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <article key={index} className="rounded-2xl border border-border bg-card p-6">
          <Skeleton className="mb-3 h-6 w-40" />
          <Skeleton className="mb-2 h-4 w-56" />
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="mb-4 h-20 w-full" />
          <Skeleton className="h-24 w-full" />
        </article>
      ))}
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="max-w-3xl rounded-2xl border border-border bg-card p-6">
      <Skeleton className="mb-5 h-7 w-40" />
      <div className="grid gap-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="grid gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
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
          className={textareaClassName}
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
