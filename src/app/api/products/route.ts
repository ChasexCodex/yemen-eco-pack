import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/server/auth";
import { ensureDatabaseReady } from "@/lib/server/bootstrap-db";
import { dbPool } from "@/lib/server/db";
import { isDbUnavailableError } from "@/lib/server/db-errors";
import { parseProductInput } from "@/lib/server/models";
import { serializeProduct } from "@/lib/server/serializers";
import { products as fallbackProducts } from "@/lib/products";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getFallbackProducts() {
  return fallbackProducts.map((product) => ({
    id: product.id,
    slug: slugify(product.name),
    name_en: product.name,
    name_ar: product.name,
    description_en: product.description,
    description_ar: product.description,
    price: product.price,
    unit_en: product.unit,
    unit_ar: product.unit,
    image_url: product.image,
    category_en: product.category,
    category_ar: product.category,
    in_stock: product.inStock,
    created_at: new Date(0).toISOString(),
  }));
}

export async function GET() {
  try {
    await ensureDatabaseReady();

    const result = await dbPool.query(`
      SELECT
        id, slug, name_en, name_ar, description_en, description_ar,
        price, unit_en, unit_ar, image_url, category_en, category_ar, in_stock, created_at
      FROM products
      ORDER BY id;
    `);

    return NextResponse.json(result.rows.map(serializeProduct));
  } catch {
    return NextResponse.json(getFallbackProducts());
  }
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

  try {
    await ensureDatabaseReady();

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
    if (isDbUnavailableError(error)) {
      return NextResponse.json(
        { error: "Database unavailable. Admin product updates are temporarily disabled." },
        { status: 503 },
      );
    }
    if (maybePgError.code === "23505") {
      return NextResponse.json(
        { error: "Product slug already exists" },
        { status: 409 },
      );
    }
    throw error;
  }
}

