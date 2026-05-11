import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/server/auth";
import { ensureDatabaseReady } from "@/lib/server/bootstrap-db";
import { dbPool } from "@/lib/server/db";
import { parseSiteSettingsInput } from "@/lib/server/models";
import { serializeSiteSettings } from "@/lib/server/serializers";

async function getSettingsRow() {
  await ensureDatabaseReady();

  const result = await dbPool.query(`
    SELECT
      logo_url, contact_email, contact_phone, address_en, address_ar, tagline_en, tagline_ar
    FROM site_settings
    WHERE id = 1;
  `);

  return result.rows[0] ?? null;
}

export async function GET() {
  const row = await getSettingsRow();
  if (!row) {
    return NextResponse.json({ error: "Settings not found" }, { status: 404 });
  }
  return NextResponse.json(serializeSiteSettings(row));
}

export async function PATCH(request: NextRequest) {
  const adminResponse = await requireAdminApi();
  if (adminResponse) {
    return adminResponse;
  }

  const payload = await request.json();
  const parsed = parseSiteSettingsInput(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  await ensureDatabaseReady();

  const updates: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  for (const [key, value] of Object.entries(parsed.data)) {
    updates.push(`${key} = $${index++}`);
    values.push(value);
  }
  updates.push(`updated_at = NOW()`);

  const query = `
    UPDATE site_settings
    SET ${updates.join(", ")}
    WHERE id = 1
    RETURNING
      logo_url, contact_email, contact_phone, address_en, address_ar, tagline_en, tagline_ar;
  `;

  const result = await dbPool.query(query, values);
  return NextResponse.json(serializeSiteSettings(result.rows[0]));
}

