export type Lang = "en" | "ar";

export type MaterialPageReference = {
  title: string;
  url: string;
};

export type MaterialPageItem = {
  id: string;
  title_en: string;
  title_ar: string;
  what_en: string;
  what_ar: string;
  benefits_en: string;
  benefits_ar: string;
  links: MaterialPageReference[];
};

export type PageContent = {
  header: {
    nav_home_en: string;
    nav_home_ar: string;
    nav_products_en: string;
    nav_products_ar: string;
    nav_materials_en: string;
    nav_materials_ar: string;
    nav_about_en: string;
    nav_about_ar: string;
    nav_contact_en: string;
    nav_contact_ar: string;
  };
  home: {
    hero_title_en: string;
    hero_title_ar: string;
    hero_subtitle_en: string;
    hero_subtitle_ar: string;
    cta_label_en: string;
    cta_label_ar: string;
    featured_title_en: string;
    featured_title_ar: string;
    featured_link_label_en: string;
    featured_link_label_ar: string;
    why_title_en: string;
    why_title_ar: string;
    why_text_en: string;
    why_text_ar: string;
    materials_link_label_en: string;
    materials_link_label_ar: string;
  };
  products: {
    title_en: string;
    title_ar: string;
    subtitle_en: string;
    subtitle_ar: string;
    empty_en: string;
    empty_ar: string;
  };
  materials: {
    title_en: string;
    title_ar: string;
    subtitle_en: string;
    subtitle_ar: string;
    references_label_en: string;
    references_label_ar: string;
    items: MaterialPageItem[];
  };
  about: {
    title_en: string;
    title_ar: string;
    mission_title_en: string;
    mission_title_ar: string;
    mission_text_en: string;
    mission_text_ar: string;
    vision_title_en: string;
    vision_title_ar: string;
    vision_text_en: string;
    vision_text_ar: string;
  };
  contact: {
    title_en: string;
    title_ar: string;
    subtitle_en: string;
    subtitle_ar: string;
    form_title_en: string;
    form_title_ar: string;
  };
  footer: {
    copyright_en: string;
    copyright_ar: string;
  };
};

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
  stock_amount: number;
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
  site_name_en: string;
  site_name_ar: string;
  logo_url: string;
  hero_images: string[];
  contact_email: string;
  contact_phone: string;
  address_en: string;
  address_ar: string;
  tagline_en: string;
  tagline_ar: string;
  page_content: PageContent;
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

export type ChatRequest = {
  messages: ChatMessage[];
  language: Lang;
  customerEmail?: string;
};

export type ChatResponse = {
  reply: string;
};

export type ChatCompletionRequest = {
  messages: ChatMessage[];
  language: Lang;
  customerEmail: string;
  rating: number;
};

export type ChatCompletionResponse = {
  ok: true;
  emailStatus: "sent" | "not_configured" | "failed";
};
