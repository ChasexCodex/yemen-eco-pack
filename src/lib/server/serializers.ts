import type { Inquiry, Product, SiteSettings } from "./models";
import { defaultPageContent } from "@/lib/site-defaults";

type ProductDbRow = {
  id: number;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: string | number;
  unit_en: string;
  unit_ar: string;
  image_url: string;
  category_en: string;
  category_ar: string;
  stock_amount: number | string;
  in_stock: boolean;
  created_at: Date | string;
};

type InquiryDbRow = {
  id: number;
  name: string;
  email: string;
  message: string;
  page: string | null;
  created_at: Date | string;
  resolved: boolean;
  reply: string | null;
};

type SiteSettingsDbRow = {
  logo_url: string;
  hero_images: string[] | null;
  contact_email: string;
  contact_phone: string;
  address_en: string;
  address_ar: string;
  tagline_en: string;
  tagline_ar: string;
  page_content: SiteSettings["page_content"] | null;
};

function toIso(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date(value).toISOString();
}

export function serializeProduct(row: ProductDbRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name_en: row.name_en,
    name_ar: row.name_ar,
    description_en: row.description_en,
    description_ar: row.description_ar,
    price: typeof row.price === "number" ? row.price : Number(row.price),
    unit_en: row.unit_en,
    unit_ar: row.unit_ar,
    image_url: row.image_url,
    category_en: row.category_en,
    category_ar: row.category_ar,
    stock_amount:
      typeof row.stock_amount === "number" ? row.stock_amount : Number(row.stock_amount),
    in_stock: row.in_stock,
    created_at: toIso(row.created_at),
  };
}

export function serializeInquiry(row: InquiryDbRow): Inquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    page: row.page ?? null,
    created_at: toIso(row.created_at),
    resolved: row.resolved,
    reply: row.reply ?? null,
  };
}

export function serializeSiteSettings(row: SiteSettingsDbRow): SiteSettings {
  return {
    logo_url: row.logo_url,
    hero_images: row.hero_images?.filter((value) => value.trim().length > 0) ?? ["/hero.png"],
    contact_email: row.contact_email,
    contact_phone: row.contact_phone,
    address_en: row.address_en,
    address_ar: row.address_ar,
    tagline_en: row.tagline_en,
    tagline_ar: row.tagline_ar,
    page_content: row.page_content ?? defaultPageContent,
  };
}
