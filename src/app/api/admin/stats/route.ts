import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/server/auth";
import { ensureDatabaseReady } from "@/lib/server/bootstrap-db";
import { dbPool } from "@/lib/server/db";
import { serializeInquiry } from "@/lib/server/serializers";

export async function GET() {
  const adminResponse = await requireAdminApi();
  if (adminResponse) {
    return adminResponse;
  }

  await ensureDatabaseReady();

  const [totalProductsResult, inStockProductsResult, totalInquiriesResult, unresolvedInquiriesResult, recentResult] =
    await Promise.all([
      dbPool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM products;"),
      dbPool.query<{ count: string }>(
        "SELECT COUNT(*)::text AS count FROM products WHERE in_stock = TRUE;",
      ),
      dbPool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM inquiries;"),
      dbPool.query<{ count: string }>(
        "SELECT COUNT(*)::text AS count FROM inquiries WHERE resolved = FALSE;",
      ),
      dbPool.query(`
        SELECT id, name, email, message, page, created_at, resolved, reply
        FROM inquiries
        ORDER BY created_at DESC
        LIMIT 5;
      `),
    ]);

  return NextResponse.json({
    total_products: Number(totalProductsResult.rows[0]?.count ?? "0"),
    in_stock_products: Number(inStockProductsResult.rows[0]?.count ?? "0"),
    total_inquiries: Number(totalInquiriesResult.rows[0]?.count ?? "0"),
    unresolved_inquiries: Number(unresolvedInquiriesResult.rows[0]?.count ?? "0"),
    recent_inquiries: recentResult.rows.map(serializeInquiry),
  });
}

