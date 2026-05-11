function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getChatWebhookUrl() {
  const explicit = process.env.N8N_CHAT_WEBHOOK_URL;
  if (explicit) {
    return explicit;
  }

  const base = process.env.WEBHOOK_URL;
  if (base) {
    return `${trimTrailingSlash(base)}/webhook/chat`;
  }

  return "https://ai.elyasamri.com/webhook/chat";
}

export function getChatWebhookAuthHeader() {
  const user = process.env.N8N_CHAT_WEBHOOK_USER;
  const pass = process.env.N8N_CHAT_WEBHOOK_PASSWORD;
  if (!user || !pass) {
    return null;
  }

  const encoded = Buffer.from(`${user}:${pass}`).toString("base64");
  return `Basic ${encoded}`;
}

