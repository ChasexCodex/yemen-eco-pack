import { NextRequest, NextResponse } from "next/server";
import { getChatWebhookAuthHeader, getChatWebhookUrl } from "@/lib/server/chat-webhook";
import { ensureDatabaseReady } from "@/lib/server/bootstrap-db";
import { dbPool } from "@/lib/server/db";
import { isDbUnavailableError } from "@/lib/server/db-errors";
import { parseChatRequest } from "@/lib/server/models";
import { serializeProduct, serializeSiteSettings } from "@/lib/server/serializers";

const SYSTEM_PROMPT_EN = `You are Mira, a warm and down-to-earth customer support agent for BioPak — a small company in Sana'a, Yemen that sells biodegradable food packaging sourced from China.

Tone:
- Talk like a real person — calm, friendly, conversational. Not corporate, not overly cheerful.
- Speak in plain prose. Do not use markdown formatting. No asterisks, no bold, no headings, no bullet lists unless the user specifically asks for a list.
- Use contractions when they sound natural.

Length:
- Keep replies short and sufficient — usually 1 to 3 sentences. Only go longer if the question genuinely needs it.
- Do not pad with greetings or sign-offs after the first message.

What you help with:
- Our products, materials, prices, and stock status
- Environmental benefits and basic shipping or order questions

If you do not know something specific, say so plainly and point the customer to the contact email or contact form. Do not invent details.`;

const SYSTEM_PROMPT_AR = `أنتِ ميرا، موظفة دعم عملاء ودودة وبسيطة في شركة BioPak — شركة صغيرة في صنعاء، اليمن تبيع تغليف طعام قابل للتحلل البيولوجي مستورد من الصين.

النبرة:
- تحدثي كإنسانة حقيقية — هادئة، ودودة، وطبيعية. ليست رسمية ولا مبالغة في الحماس.
- اكتبي نصًا عاديًا فقط. لا تستخدمي markdown، ولا النجوم، ولا العناوين، ولا القوائم النقطية إلا إذا طلب المستخدم ذلك صراحة.

الطول:
- اجعلي الردود قصيرة وكافية — عادة من جملة إلى ثلاث جمل. أطيلي فقط إذا تطلب السؤال ذلك فعلًا.
- لا تكرري التحية أو الوداع بعد الرسالة الأولى.

ما تساعدين فيه:
- منتجاتنا، المواد، الأسعار، وحالة التوفر
- الفوائد البيئية وأسئلة الطلبات والشحن العامة

إذا لم تعرفي معلومة محددة، فقولي ذلك بوضوح ووجّهي العميل إلى البريد الإلكتروني أو نموذج التواصل. لا تختلقي تفاصيل.`;

type ProductRow = {
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

type SettingsRow = {
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  address_en: string;
  address_ar: string;
  tagline_en: string;
  tagline_ar: string;
};

async function loadChatContext() {
  try {
    await ensureDatabaseReady();

    const [productsResult, settingsResult] = await Promise.all([
      dbPool.query<ProductRow>(`
        SELECT
          id, slug, name_en, name_ar, description_en, description_ar,
          price, unit_en, unit_ar, image_url, category_en, category_ar, stock_amount, in_stock, created_at
        FROM products
        ORDER BY id;
      `),
      dbPool.query<SettingsRow>(`
        SELECT
          logo_url, contact_email, contact_phone, address_en, address_ar, tagline_en, tagline_ar
        FROM site_settings
        WHERE id = 1;
      `),
    ]);

    return {
      products: productsResult.rows.map(serializeProduct),
      settings: serializeSiteSettings(settingsResult.rows[0]),
    };
  } catch (error) {
    if (isDbUnavailableError(error)) {
      return null;
    }
    throw error;
  }
}

function buildCatalogContext(
  language: "en" | "ar",
  contactEmail: string,
  products: Array<{
    name_en: string;
    name_ar: string;
    price: number;
    unit_en: string;
    unit_ar: string;
    in_stock: boolean;
  }>,
) {
  const systemPrompt = language === "ar" ? SYSTEM_PROMPT_AR : SYSTEM_PROMPT_EN;
  const productSummary = products
    .map((product) =>
      language === "ar"
        ? `${product.name_ar} — $${product.price.toFixed(2)} لكل ${product.unit_ar} — ${product.in_stock ? "متوفر" : "غير متوفر"}`
        : `${product.name_en} — $${product.price.toFixed(2)} per ${product.unit_en} — ${product.in_stock ? "In stock" : "Out of stock"}`,
    )
    .join("\n");

  const catalogBlock =
    language === "ar"
      ? `\n\nالبريد الإلكتروني للتواصل: ${contactEmail}\n\nالمنتجات المتاحة حاليًا:\n${productSummary}`
      : `\n\nContact email: ${contactEmail}\n\nCurrently available products:\n${productSummary}`;

  return `${systemPrompt}${catalogBlock}`;
}

function cleanReply(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "$1")
    .replace(/\*/g, "")
    .replace(/__(.+?)__/g, "$1")
    .replace(/^\s*[-•]\s+/gm, "")
    .trim();
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = parseChatRequest(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const lastUserMessage =
    [...parsed.data.messages].reverse().find((message) => message.role === "user")
      ?.content ?? "";

  const authHeader = getChatWebhookAuthHeader();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const context = await loadChatContext();
  if (!context) {
    return NextResponse.json(
      { error: "Database unavailable. Chat context is temporarily unavailable." },
      { status: 503 },
    );
  }

  const contactEmail = context.settings.contact_email;
  const catalogContext = buildCatalogContext(parsed.data.language, contactEmail, context.products);
  const enrichedMessages = [
    { role: "system" as const, content: catalogContext },
    ...parsed.data.messages,
  ];

  const upstreamResponse = await fetch(getChatWebhookUrl(), {
    method: "POST",
    headers,
    body: JSON.stringify({
      message: lastUserMessage,
      messages: enrichedMessages,
      language: parsed.data.language,
      contactEmail,
      productCatalog: context.products,
    }),
    cache: "no-store",
  });

  if (!upstreamResponse.ok) {
    const errorText = await upstreamResponse.text();
    return NextResponse.json(
      { error: `Chat service unavailable: ${errorText || upstreamResponse.statusText}` },
      { status: 502 },
    );
  }

  const upstreamBody = (await upstreamResponse.json()) as
    | { reply?: unknown; text?: unknown }
    | null;

  const reply =
    typeof upstreamBody?.reply === "string"
      ? upstreamBody.reply
      : typeof upstreamBody?.text === "string"
        ? upstreamBody.text
        : null;

  if (!reply) {
    return NextResponse.json({ error: "Chat service returned no reply" }, { status: 502 });
  }

  return NextResponse.json({ reply: cleanReply(reply) });
}

