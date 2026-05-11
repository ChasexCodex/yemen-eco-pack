import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/server/auth";
import { ensureDatabaseReady } from "@/lib/server/bootstrap-db";
import { dbPool } from "@/lib/server/db";
import { isDbUnavailableError } from "@/lib/server/db-errors";
import { parsePositiveInt, parseUpdateInquiryInput } from "@/lib/server/models";
import { serializeInquiry } from "@/lib/server/serializers";

async function parseId(params: Promise<{ id: string }>) {
  const { id } = await params;
  return parsePositiveInt(id);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminResponse = await requireAdminApi();
  if (adminResponse) {
    return adminResponse;
  }

  const id = await parseId(params);
  if (!id) {
    return NextResponse.json({ error: "Invalid inquiry id" }, { status: 400 });
  }

  const payload = await request.json();
  const parsed = parseUpdateInquiryInput(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    await ensureDatabaseReady();

    const updates: string[] = [];
    const values: unknown[] = [];
    let index = 1;

    if (parsed.data.resolved !== undefined) {
      updates.push(`resolved = $${index++}`);
      values.push(parsed.data.resolved);
    }

    if (Object.prototype.hasOwnProperty.call(parsed.data, "reply")) {
      updates.push(`reply = $${index++}`);
      values.push(parsed.data.reply ?? null);
    }

    values.push(id);

    const result = await dbPool.query(
      `
        UPDATE inquiries
        SET ${updates.join(", ")}
        WHERE id = $${index}
        RETURNING id, name, email, message, page, created_at, resolved, reply;
      `,
      values,
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json(serializeInquiry(result.rows[0]));
  } catch (error: unknown) {
    if (isDbUnavailableError(error)) {
      return NextResponse.json(
        { error: "Database unavailable. Admin updates are temporarily disabled." },
        { status: 503 },
      );
    }
    throw error;
  }
}

