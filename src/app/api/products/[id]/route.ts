import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/server/auth";
import { ensureDatabaseReady } from "@/lib/server/bootstrap-db";
import { dbPool } from "@/lib/server/db";
import { parsePositiveInt, parseProductInput } from "@/lib/server/models";
import { serializeProduct } from "@/lib/server/serializers";
import { getProductById as getFallbackProductById } from "@/lib/products";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function serializeFallbackProduct(id: number) {
  const product = getFallbackProductById(id);
  if (!product) return null;
  return {
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
  };
}

async function parseId(params: Promise<{ id: string }>) {
  const { id } = await params;
  return parsePositiveInt(id);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await parseId(params);
  if (!id) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  try {
    await ensureDatabaseReady();

    const result = await dbPool.query(
      `
        SELECT
          id, slug, name_en, name_ar, description_en, description_ar,
          price, unit_en, unit_ar, image_url, category_en, category_ar, in_stock, created_at
        FROM products
        WHERE id = $1;
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(serializeProduct(result.rows[0]));
  } catch {
    const fallback = serializeFallbackProduct(id);
    if (!fallback) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(fallback);
  }
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
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
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
        UPDATE products
        SET
          slug = $1,
          name_en = $2,
          name_ar = $3,
          description_en = $4,
          description_ar = $5,
          price = $6,
          unit_en = $7,
          unit_ar = $8,
          image_url = $9,
          category_en = $10,
          category_ar = $11,
          in_stock = $12
        WHERE id = $13
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
        id,
      ],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(serializeProduct(result.rows[0]));
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminResponse = await requireAdminApi();
  if (adminResponse) {
    return adminResponse;
  }

  const id = await parseId(params);
  if (!id) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  await ensureDatabaseReady();

  const result = await dbPool.query(
    `
      DELETE FROM products
      WHERE id = $1
      RETURNING id;
    `,
    [id],
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}

