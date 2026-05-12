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
  contact_email: string;
  contact_phone: string;
  address_en: string;
  address_ar: string;
  tagline_en: string;
  tagline_ar: string;
};

export type SiteSettingsInput = Partial<SiteSettings>;

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
};

export type ChatResponse = {
  reply: string;
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

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
  const keys: (keyof SiteSettings)[] = [
    "logo_url",
    "contact_email",
    "contact_phone",
    "address_en",
    "address_ar",
    "tagline_en",
    "tagline_ar",
  ];

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

  if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
    return { success: false, error: "messages must be a non-empty array" };
  }

  const language = payload.language;
  if (language !== "en" && language !== "ar") {
    return { success: false, error: "language must be en or ar" };
  }

  const messages: ChatMessage[] = [];
  for (const message of payload.messages) {
    if (!isRecord(message)) {
      return { success: false, error: "Invalid chat message" };
    }
    const role = message.role;
    const content = asNonEmptyString(message.content);
    if (
      (role !== "system" && role !== "user" && role !== "assistant") ||
      !content
    ) {
      return { success: false, error: "Invalid chat message" };
    }
    messages.push({
      role,
      content,
    });
  }

  return {
    success: true,
    data: {
      messages,
      language,
    },
  };
}

export function parsePositiveInt(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

