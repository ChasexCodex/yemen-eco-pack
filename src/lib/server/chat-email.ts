import nodemailer from "nodemailer";
import type { ChatMessage, Lang } from "@/lib/types";
import { resolveAdminEmail } from "@/lib/server/admin-config";

type SendChatSummaryEmailInput = {
  customerEmail: string;
  rating: number;
  language: Lang;
  messages: ChatMessage[];
};

function readMailerConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim() || process.env.SMTP_USERNAME?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim() || process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim() || user;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return {
    host,
    user,
    pass,
    from,
    port,
    secure,
  };
}

export function isChatEmailConfigured() {
  const { host, user, pass, from } = readMailerConfig();
  return Boolean(host && user && pass && from);
}

function getMailerConfig() {
  const { host, user, pass, from, port, secure } = readMailerConfig();

  if (!host || !user || !pass || !from) {
    throw new Error(
      "SMTP email delivery is not configured. Set SMTP_HOST, SMTP_USER or SMTP_USERNAME, SMTP_PASSWORD or SMTP_PASS, and SMTP_FROM.",
    );
  }

  return {
    host,
    user,
    pass,
    from,
    port,
    secure,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clip(value: string, maxLength = 180) {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1)}…`;
}

function buildConversationSummary(messages: ChatMessage[], language: Lang) {
  const userMessages = messages.filter((message) => message.role === "user");
  const assistantMessages = messages.filter((message) => message.role === "assistant");
  const firstQuestion = userMessages[0]?.content ?? "";
  const latestQuestion = userMessages[userMessages.length - 1]?.content ?? "";
  const keyTopics = userMessages.slice(0, 3).map((message) => clip(message.content, 120));

  if (language === "ar") {
    return [
      `بدأت المحادثة بسؤال عن: ${firstQuestion ? clip(firstQuestion) : "لا يوجد"}`,
      `آخر رسالة من العميل: ${latestQuestion ? clip(latestQuestion) : "لا يوجد"}`,
      `عدد رسائل العميل: ${userMessages.length}`,
      `عدد ردود المساعد: ${assistantMessages.length}`,
      keyTopics.length > 0 ? `أبرز النقاط: ${keyTopics.join(" | ")}` : "أبرز النقاط: لا يوجد",
    ].join("\n");
  }

  return [
    `The conversation opened with: ${firstQuestion ? clip(firstQuestion) : "No customer message captured"}`,
    `The latest customer message was: ${latestQuestion ? clip(latestQuestion) : "No customer message captured"}`,
    `Customer messages: ${userMessages.length}`,
    `Assistant replies: ${assistantMessages.length}`,
    keyTopics.length > 0 ? `Key topics: ${keyTopics.join(" | ")}` : "Key topics: None",
  ].join("\n");
}

function formatTranscript(messages: ChatMessage[], language: Lang) {
  return messages
    .map((message, index) => {
      const label =
        language === "ar"
          ? message.role === "user"
            ? "العميل"
            : message.role === "assistant"
              ? "المساعد"
              : "النظام"
          : message.role === "user"
            ? "Customer"
            : message.role === "assistant"
              ? "Assistant"
              : "System";
      return `${index + 1}. ${label}: ${message.content}`;
    })
    .join("\n\n");
}

export async function sendChatSummaryEmail({
  customerEmail,
  rating,
  language,
  messages,
}: SendChatSummaryEmailInput) {
  const { host, user, pass, from, port, secure } = getMailerConfig();
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  const adminEmail = resolveAdminEmail();
  const summary = buildConversationSummary(messages, language);
  const transcript = formatTranscript(messages, language);
  const submittedAt = new Date().toISOString();
  const subject =
    language === "ar"
      ? `ملخص محادثة جديدة من ${customerEmail} — التقييم ${rating}/5`
      : `New chat summary from ${customerEmail} — rating ${rating}/5`;

  const text =
    language === "ar"
      ? `تم إنهاء جلسة دعم جديدة.\n\nالبريد الإلكتروني للعميل: ${customerEmail}\nالتقييم: ${rating}/5\nاللغة: ${language}\nوقت الإرسال: ${submittedAt}\n\nالملخص:\n${summary}\n\nالتفاصيل الكاملة:\n${transcript}`
      : `A new support chat has been completed.\n\nCustomer email: ${customerEmail}\nRating: ${rating}/5\nLanguage: ${language}\nSubmitted at: ${submittedAt}\n\nSummary:\n${summary}\n\nFull transcript:\n${transcript}`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2>${language === "ar" ? "ملخص جلسة دعم" : "Support chat summary"}</h2>
      <p><strong>${language === "ar" ? "البريد الإلكتروني للعميل" : "Customer email"}:</strong> ${escapeHtml(customerEmail)}</p>
      <p><strong>${language === "ar" ? "التقييم" : "Rating"}:</strong> ${rating}/5</p>
      <p><strong>${language === "ar" ? "اللغة" : "Language"}:</strong> ${escapeHtml(language)}</p>
      <p><strong>${language === "ar" ? "وقت الإرسال" : "Submitted at"}:</strong> ${escapeHtml(submittedAt)}</p>
      <h3>${language === "ar" ? "الملخص" : "Summary"}</h3>
      <pre style="white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 8px;">${escapeHtml(summary)}</pre>
      <h3>${language === "ar" ? "التفاصيل الكاملة" : "Full transcript"}</h3>
      <pre style="white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 8px;">${escapeHtml(transcript)}</pre>
    </div>
  `;

  await transporter.sendMail({
    from,
    to: adminEmail,
    replyTo: customerEmail,
    subject,
    text,
    html,
  });
}
