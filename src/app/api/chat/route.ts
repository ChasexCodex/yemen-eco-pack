import { NextRequest, NextResponse } from "next/server";
import { getChatWebhookAuthHeader, getChatWebhookUrl } from "@/lib/server/chat-webhook";
import { parseChatRequest } from "@/lib/server/models";

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

  const upstreamResponse = await fetch(getChatWebhookUrl(), {
    method: "POST",
    headers,
    body: JSON.stringify({
      message: lastUserMessage,
      messages: parsed.data.messages,
      language: parsed.data.language,
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

  return NextResponse.json({ reply });
}

