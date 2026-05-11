import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/server/auth";
import { ensureDatabaseReady } from "@/lib/server/bootstrap-db";
import { dbPool } from "@/lib/server/db";
import { parseProductInput } from "@/lib/server/models";
import { serializeProduct } from "@/lib/server/serializers";

export async function GET() {
  await ensureDatabaseReady();

  const result = await dbPool.query(`
    SELECT
      id, slug, name_en, name_ar, description_en, description_ar,
      price, unit_en, unit_ar, image_url, category_en, category_ar, in_stock, created_at
    FROM products
    ORDER BY id;
  `);

  return NextResponse.json(result.rows.map(serializeProduct));
}

export async function POST(request: NextRequest) {
  const adminResponse = await requireAdminApi();
  if (adminResponse) {
    return adminResponse;
  }

  const payload = await request.json();
  const parsed = parseProductInput(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  await ensureDatabaseReady();

  try {
    const result = await dbPool.query(
      `
        INSERT INTO products (
          slug, name_en, name_ar, description_en, description_ar,
          price, unit_en, unit_ar, image_url, category_en, category_ar, in_stock
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11, $12
        )
        RETURNING
          id, slug, name_en, name_ar, description_en, description_ar,
          price, unit_en, unit_ar, image_url, category_en, category_ar, in_stock, created_at;
      `,
      [
        parsed.data.slug,
        parsed.data.name_en,
        parsed.data.name_ar,
        parsed.data.description_en,
        parsed.data.description_ar,
        parsed.data.price,
        parsed.data.unit_en,
        parsed.data.unit_ar,
        parsed.data.image_url,
        parsed.data.category_en,
        parsed.data.category_ar,
        parsed.data.in_stock,
      ],
    );

    return NextResponse.json(serializeProduct(result.rows[0]), { status: 201 });
  } catch (error: unknown) {
    const maybePgError = error as { code?: string };
    if (maybePgError.code === "23505") {
      return NextResponse.json(
        { error: "Product slug already exists" },
        { status: 409 },
      );
    }
    throw error;
  }
}

