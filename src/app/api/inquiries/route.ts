import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/server/auth";
import { ensureDatabaseReady } from "@/lib/server/bootstrap-db";
import { dbPool } from "@/lib/server/db";
import { parseInquiryInput } from "@/lib/server/models";
import { serializeInquiry } from "@/lib/server/serializers";

export async function GET() {
  const adminResponse = await requireAdminApi();
  if (adminResponse) {
    return adminResponse;
  }

  await ensureDatabaseReady();

  const result = await dbPool.query(`
    SELECT id, name, email, message, page, created_at, resolved, reply
    FROM inquiries
    ORDER BY created_at DESC;
  `);

  return NextResponse.json(result.rows.map(serializeInquiry));
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = parseInquiryInput(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  await ensureDatabaseReady();

  const result = await dbPool.query(
    `
      INSERT INTO inquiries (name, email, message, page)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, message, page, created_at, resolved, reply;
    `,
    [parsed.data.name, parsed.data.email, parsed.data.message, parsed.data.page ?? null],
  );

  return NextResponse.json(serializeInquiry(result.rows[0]), { status: 201 });
}

