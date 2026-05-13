import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/server/auth";
import { ensureDatabaseReady } from "@/lib/server/bootstrap-db";
import { dbPool } from "@/lib/server/db";
import { isDbUnavailableError } from "@/lib/server/db-errors";
import { parseSiteSettingsInput } from "@/lib/server/models";
import { serializeSiteSettings } from "@/lib/server/serializers";
import { defaultSiteSettings } from "@/lib/site-defaults";

async function getSettingsRow() {
  await ensureDatabaseReady();

  const result = await dbPool.query(`
    SELECT
      logo_url, hero_images, contact_email, contact_phone, address_en, address_ar, tagline_en, tagline_ar, page_content
    FROM site_settings
    WHERE id = 1;
  `);

  return result.rows[0] ?? null;
}

export async function GET() {
  try {
    const row = await getSettingsRow();
    if (!row) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }
    return NextResponse.json(serializeSiteSettings(row));
  } catch {
    return NextResponse.json(defaultSiteSettings);
  }
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

  try {
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
        logo_url, hero_images, contact_email, contact_phone, address_en, address_ar, tagline_en, tagline_ar, page_content;
    `;

    const result = await dbPool.query(query, values);
    return NextResponse.json(serializeSiteSettings(result.rows[0]));
  } catch (error: unknown) {
    if (isDbUnavailableError(error)) {
      return NextResponse.json(
        { error: "Database unavailable. Admin settings updates are temporarily disabled." },
        { status: 503 },
      );
    }
    throw error;
  }
}
