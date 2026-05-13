import { NextRequest, NextResponse } from "next/server";
import { parseChatCompletionInput } from "@/lib/server/models";
import { sendChatSummaryEmail } from "@/lib/server/chat-email";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = parseChatCompletionInput(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    await sendChatSummaryEmail(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send the completed chat email.",
      },
      { status: 500 },
    );
  }
}
