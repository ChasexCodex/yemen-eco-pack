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

export type UpdateInquiryInput = {
  resolved?: boolean;
  reply?: string | null;
};

export type SiteSettings = {
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

export type SiteSettingsInput = Partial<SiteSettings>;

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
};

export type AdminStatus = {
  is_admin: boolean;
  signed_in: boolean;
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
  language: "en" | "ar";
  customerEmail?: string;
};

export type ChatResponse = {
  reply: string;
};

export type ChatCompletionInput = {
  messages: ChatMessage[];
  language: "en" | "ar";
  customerEmail: string;
  rating: number;
};

type ValidationSuccess<T> = { success: true; data: T };
type ValidationFailure = { success: false; error: string };
type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNonEmptyString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseNumber(value: unknown) {
  const candidate =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(candidate) ? candidate : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getRequiredString(payload: Record<string, unknown>, key: string) {
  return asNonEmptyString(payload[key]);
}

function parseMaterialReferences(value: unknown): ValidationResult<MaterialPageReference[]> {
  if (!Array.isArray(value)) {
    return { success: false, error: "Invalid material links" };
  }

  const links: MaterialPageReference[] = [];
  for (const item of value) {
    if (!isRecord(item)) {
      return { success: false, error: "Invalid material links" };
    }
    const title = asNonEmptyString(item.title);
    const url = asNonEmptyString(item.url);
    if (!title || !url || !isValidHttpUrl(url)) {
      return { success: false, error: "Invalid material links" };
    }
    links.push({ title, url });
  }

  return { success: true, data: links };
}

function parseMaterialItems(value: unknown): ValidationResult<MaterialPageItem[]> {
  if (!Array.isArray(value)) {
    return { success: false, error: "Invalid materials items" };
  }

  const items: MaterialPageItem[] = [];
  for (const item of value) {
    if (!isRecord(item)) {
      return { success: false, error: "Invalid materials items" };
    }

    const id = asNonEmptyString(item.id);
    const title_en = asNonEmptyString(item.title_en);
    const title_ar = asNonEmptyString(item.title_ar);
    const what_en = asNonEmptyString(item.what_en);
    const what_ar = asNonEmptyString(item.what_ar);
    const benefits_en = asNonEmptyString(item.benefits_en);
    const benefits_ar = asNonEmptyString(item.benefits_ar);
    const links = parseMaterialReferences(item.links);

    if (
      !id ||
      !title_en ||
      !title_ar ||
      !what_en ||
      !what_ar ||
      !benefits_en ||
      !benefits_ar ||
      !links.success
    ) {
      return { success: false, error: "Invalid materials items" };
    }

    items.push({
      id,
      title_en,
      title_ar,
      what_en,
      what_ar,
      benefits_en,
      benefits_ar,
      links: links.data,
    });
  }

  return { success: true, data: items };
}

function parsePageContent(value: unknown): ValidationResult<PageContent> {
  if (!isRecord(value)) {
    return { success: false, error: "Invalid page content" };
  }

  const home = value.home;
  const products = value.products;
  const materials = value.materials;
  const about = value.about;
  const contact = value.contact;

  if (
    !isRecord(home) ||
    !isRecord(products) ||
    !isRecord(materials) ||
    !isRecord(about) ||
    !isRecord(contact)
  ) {
    return { success: false, error: "Invalid page content" };
  }

  const materialItems = parseMaterialItems(materials.items);
  if (!materialItems.success) {
    return { success: false, error: materialItems.error };
  }

  const parsed: PageContent = {
    home: {
      hero_title_en: getRequiredString(home, "hero_title_en") ?? "",
      hero_title_ar: getRequiredString(home, "hero_title_ar") ?? "",
      hero_subtitle_en: getRequiredString(home, "hero_subtitle_en") ?? "",
      hero_subtitle_ar: getRequiredString(home, "hero_subtitle_ar") ?? "",
      cta_label_en: getRequiredString(home, "cta_label_en") ?? "",
      cta_label_ar: getRequiredString(home, "cta_label_ar") ?? "",
      featured_title_en: getRequiredString(home, "featured_title_en") ?? "",
      featured_title_ar: getRequiredString(home, "featured_title_ar") ?? "",
      featured_link_label_en: getRequiredString(home, "featured_link_label_en") ?? "",
      featured_link_label_ar: getRequiredString(home, "featured_link_label_ar") ?? "",
      why_title_en: getRequiredString(home, "why_title_en") ?? "",
      why_title_ar: getRequiredString(home, "why_title_ar") ?? "",
      why_text_en: getRequiredString(home, "why_text_en") ?? "",
      why_text_ar: getRequiredString(home, "why_text_ar") ?? "",
      materials_link_label_en: getRequiredString(home, "materials_link_label_en") ?? "",
      materials_link_label_ar: getRequiredString(home, "materials_link_label_ar") ?? "",
    },
    products: {
      title_en: getRequiredString(products, "title_en") ?? "",
      title_ar: getRequiredString(products, "title_ar") ?? "",
      subtitle_en: getRequiredString(products, "subtitle_en") ?? "",
      subtitle_ar: getRequiredString(products, "subtitle_ar") ?? "",
      empty_en: getRequiredString(products, "empty_en") ?? "",
      empty_ar: getRequiredString(products, "empty_ar") ?? "",
    },
    materials: {
      title_en: getRequiredString(materials, "title_en") ?? "",
      title_ar: getRequiredString(materials, "title_ar") ?? "",
      subtitle_en: getRequiredString(materials, "subtitle_en") ?? "",
      subtitle_ar: getRequiredString(materials, "subtitle_ar") ?? "",
      references_label_en: getRequiredString(materials, "references_label_en") ?? "",
      references_label_ar: getRequiredString(materials, "references_label_ar") ?? "",
      items: materialItems.data,
    },
    about: {
      title_en: getRequiredString(about, "title_en") ?? "",
      title_ar: getRequiredString(about, "title_ar") ?? "",
      mission_title_en: getRequiredString(about, "mission_title_en") ?? "",
      mission_title_ar: getRequiredString(about, "mission_title_ar") ?? "",
      mission_text_en: getRequiredString(about, "mission_text_en") ?? "",
      mission_text_ar: getRequiredString(about, "mission_text_ar") ?? "",
      vision_title_en: getRequiredString(about, "vision_title_en") ?? "",
      vision_title_ar: getRequiredString(about, "vision_title_ar") ?? "",
      vision_text_en: getRequiredString(about, "vision_text_en") ?? "",
      vision_text_ar: getRequiredString(about, "vision_text_ar") ?? "",
    },
    contact: {
      title_en: getRequiredString(contact, "title_en") ?? "",
      title_ar: getRequiredString(contact, "title_ar") ?? "",
      subtitle_en: getRequiredString(contact, "subtitle_en") ?? "",
      subtitle_ar: getRequiredString(contact, "subtitle_ar") ?? "",
      form_title_en: getRequiredString(contact, "form_title_en") ?? "",
      form_title_ar: getRequiredString(contact, "form_title_ar") ?? "",
    },
  };

  const hasEmptyField =
    Object.values(parsed.home).some((field) => field.length === 0) ||
    Object.values(parsed.products).some((field) => field.length === 0) ||
    Object.entries(parsed.materials)
      .filter(([key]) => key !== "items")
      .some(([, field]) => typeof field === "string" && field.length === 0) ||
    Object.values(parsed.about).some((field) => field.length === 0) ||
    Object.values(parsed.contact).some((field) => field.length === 0);

  if (hasEmptyField) {
    return { success: false, error: "Invalid page content" };
  }

  return { success: true, data: parsed };
}

function parseChatMessages(value: unknown): ValidationResult<ChatMessage[]> {
  if (!Array.isArray(value) || value.length === 0) {
    return { success: false, error: "messages must be a non-empty array" };
  }

  const messages: ChatMessage[] = [];
  for (const message of value) {
    if (!isRecord(message)) {
      return { success: false, error: "Invalid chat message" };
    }
    const role = message.role;
    const content = asNonEmptyString(message.content);
    if ((role !== "system" && role !== "user" && role !== "assistant") || !content) {
      return { success: false, error: "Invalid chat message" };
    }
    messages.push({
      role,
      content,
    });
  }

  return { success: true, data: messages };
}

export function parseProductInput(payload: unknown): ValidationResult<ProductInput> {
  if (!isRecord(payload)) {
    return { success: false, error: "Invalid payload" };
  }

  const slug = asNonEmptyString(payload.slug);
  const name_en = asNonEmptyString(payload.name_en);
  const name_ar = asNonEmptyString(payload.name_ar);
  const description_en = asNonEmptyString(payload.description_en);
  const description_ar = asNonEmptyString(payload.description_ar);
  const unit_en = asNonEmptyString(payload.unit_en);
  const unit_ar = asNonEmptyString(payload.unit_ar);
  const image_url = asNonEmptyString(payload.image_url);
  const category_en = asNonEmptyString(payload.category_en);
  const category_ar = asNonEmptyString(payload.category_ar);
  const price = parseNumber(payload.price);
  const stock_amount = parseNumber(payload.stock_amount);

  if (
    !slug ||
    !name_en ||
    !name_ar ||
    !description_en ||
    !description_ar ||
    !unit_en ||
    !unit_ar ||
    !image_url ||
    !category_en ||
    !category_ar ||
    price === null ||
    price < 0 ||
    stock_amount === null ||
    !Number.isInteger(stock_amount) ||
    stock_amount < 0
  ) {
    return { success: false, error: "Invalid product input" };
  }

  return {
    success: true,
    data: {
      slug,
      name_en,
      name_ar,
      description_en,
      description_ar,
      price,
      unit_en,
      unit_ar,
      image_url,
      category_en,
      category_ar,
      stock_amount,
      in_stock: stock_amount > 0,
    },
  };
}

export function parseInquiryInput(payload: unknown): ValidationResult<InquiryInput> {
  if (!isRecord(payload)) {
    return { success: false, error: "Invalid payload" };
  }

  const name = asNonEmptyString(payload.name);
  const email = asNonEmptyString(payload.email);
  const message = asNonEmptyString(payload.message);
  const page =
    payload.page === undefined || payload.page === null ? null : asNonEmptyString(payload.page);

  if (!name || name.length > 200) {
    return { success: false, error: "Invalid inquiry name" };
  }

  if (!email || !isValidEmail(email)) {
    return { success: false, error: "Invalid inquiry email" };
  }

  if (!message || message.length > 4000) {
    return { success: false, error: "Invalid inquiry message" };
  }

  if (payload.page !== undefined && payload.page !== null && !page) {
    return { success: false, error: "Invalid inquiry page" };
  }

  return {
    success: true,
    data: {
      name,
      email,
      message,
      page,
    },
  };
}

export function parseUpdateInquiryInput(
  payload: unknown,
): ValidationResult<UpdateInquiryInput> {
  if (!isRecord(payload)) {
    return { success: false, error: "Invalid payload" };
  }

  const output: UpdateInquiryInput = {};

  if ("resolved" in payload) {
    if (typeof payload.resolved !== "boolean") {
      return { success: false, error: "Invalid inquiry resolution state" };
    }
    output.resolved = payload.resolved;
  }

  if ("reply" in payload) {
    if (payload.reply === null) {
      output.reply = null;
    } else {
      const reply = asNonEmptyString(payload.reply);
      if (!reply) {
        return { success: false, error: "Invalid inquiry reply" };
      }
      output.reply = reply;
    }
  }

  if (!("resolved" in output) && !("reply" in output)) {
    return { success: false, error: "No inquiry fields to update" };
  }

  return { success: true, data: output };
}

export function parseSiteSettingsInput(
  payload: unknown,
): ValidationResult<SiteSettingsInput> {
  if (!isRecord(payload)) {
    return { success: false, error: "Invalid payload" };
  }

  const output: SiteSettingsInput = {};
  const keys: (keyof Omit<SiteSettings, "hero_images" | "page_content">)[] = [
    "logo_url",
    "contact_email",
    "contact_phone",
    "address_en",
    "address_ar",
    "tagline_en",
    "tagline_ar",
  ];

  if ("hero_images" in payload) {
    if (!Array.isArray(payload.hero_images) || payload.hero_images.length > 5) {
      return { success: false, error: "Invalid value for hero_images" };
    }

    const heroImages = payload.hero_images
      .map((value) => asNonEmptyString(value))
      .filter((value): value is string => value !== null);

    if (heroImages.length !== payload.hero_images.length) {
      return { success: false, error: "Invalid value for hero_images" };
    }

    output.hero_images = heroImages;
  }

  if ("page_content" in payload) {
    const parsedPageContent = parsePageContent(payload.page_content);
    if (!parsedPageContent.success) {
      return parsedPageContent;
    }
    output.page_content = parsedPageContent.data;
  }

  for (const key of keys) {
    if (key in payload) {
      const value = asNonEmptyString(payload[key]);
      if (!value) {
        return { success: false, error: `Invalid value for ${key}` };
      }
      output[key] = value;
    }
  }

  if (Object.keys(output).length === 0) {
    return { success: false, error: "No site settings fields to update" };
  }

  return { success: true, data: output };
}

export function parseChatRequest(payload: unknown): ValidationResult<ChatRequest> {
  if (!isRecord(payload)) {
    return { success: false, error: "Invalid payload" };
  }

  const language = payload.language;
  if (language !== "en" && language !== "ar") {
    return { success: false, error: "language must be en or ar" };
  }

  const parsedMessages = parseChatMessages(payload.messages);
  if (!parsedMessages.success) {
    return parsedMessages;
  }

  const parsedCustomerEmail =
    payload.customerEmail === undefined ? undefined : asNonEmptyString(payload.customerEmail);
  if (
    payload.customerEmail !== undefined &&
    (!parsedCustomerEmail || !isValidEmail(parsedCustomerEmail))
  ) {
    return { success: false, error: "customerEmail must be a valid email address" };
  }

  return {
    success: true,
    data: {
      messages: parsedMessages.data,
      language,
      customerEmail: parsedCustomerEmail ?? undefined,
    },
  };
}

export function parseChatCompletionInput(
  payload: unknown,
): ValidationResult<ChatCompletionInput> {
  if (!isRecord(payload)) {
    return { success: false, error: "Invalid payload" };
  }

  const language = payload.language;
  if (language !== "en" && language !== "ar") {
    return { success: false, error: "language must be en or ar" };
  }

  const customerEmail = asNonEmptyString(payload.customerEmail);
  if (!customerEmail || !isValidEmail(customerEmail)) {
    return { success: false, error: "customerEmail must be a valid email address" };
  }

  const rating = parseNumber(payload.rating);
  if (rating === null || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "rating must be an integer between 1 and 5" };
  }

  const parsedMessages = parseChatMessages(payload.messages);
  if (!parsedMessages.success) {
    return parsedMessages;
  }

  return {
    success: true,
    data: {
      messages: parsedMessages.data,
      language,
      customerEmail,
      rating,
    },
  };
}

export function parsePositiveInt(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
