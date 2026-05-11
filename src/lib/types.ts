export type Lang = "en" | "ar";

export type Product = {
  id: number;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  unit_en: string;
  unit_ar: string;
  image_url: string;
  category_en: string;
  category_ar: string;
  in_stock: boolean;
  created_at: string;
};

export type ProductInput = Omit<Product, "id" | "created_at">;

export type Inquiry = {
  id: number;
  name: string;
  email: string;
  message: string;
  page: string | null;
  created_at: string;
  resolved: boolean;
  reply: string | null;
};

export type InquiryInput = {
  name: string;
  email: string;
  message: string;
  page?: string | null;
};

export type SiteSettings = {
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  address_en: string;
  address_ar: string;
  tagline_en: string;
  tagline_ar: string;
};

export type AdminStats = {
  total_products: number;
  in_stock_products: number;
  total_inquiries: number;
  unresolved_inquiries: number;
  recent_inquiries: Inquiry[];
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

