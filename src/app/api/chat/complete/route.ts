import { NextRequest, NextResponse } from "next/server";
import { parseChatCompletionInput } from "@/lib/server/models";
import { isChatEmailConfigured, sendChatSummaryEmail } from "@/lib/server/chat-email";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = parseChatCompletionInput(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (!isChatEmailConfigured()) {
    return NextResponse.json({ ok: true, emailStatus: "not_configured" as const });
  }

  try {
    await sendChatSummaryEmail(parsed.data);
    return NextResponse.json({ ok: true, emailStatus: "sent" as const });
  } catch (error: unknown) {
    console.error("Chat summary email failed", error);
    return NextResponse.json({ ok: true, emailStatus: "failed" as const });
  }
}
