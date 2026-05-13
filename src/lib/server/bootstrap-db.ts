import { products as fallbackProducts } from "@/lib/products";
import { defaultPageContent } from "@/lib/site-defaults";
import { dbPool } from "./db";

type SeedProduct = {
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  unit_en: string;
  unit_ar: string;
  image_url: string;
  category_en: string;
  category_ar: string;
  stock_amount: number;
  in_stock: boolean;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const seedProducts: SeedProduct[] = fallbackProducts.map((product) => ({
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
  stock_amount: product.stockAmount,
  in_stock: product.inStock,
}));

const defaultPageContentSql = JSON.stringify(defaultPageContent).replace(/'/g, "''");

let bootstrapPromise: Promise<void> | null = null;

async function runBootstrap() {
  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name_en TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        description_en TEXT NOT NULL,
        description_ar TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        unit_en TEXT NOT NULL,
        unit_ar TEXT NOT NULL,
        image_url TEXT NOT NULL,
        category_en TEXT NOT NULL,
        category_ar TEXT NOT NULL,
        stock_amount INTEGER NOT NULL DEFAULT 0,
        in_stock BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS stock_amount INTEGER;
    `);

    await client.query(`
      UPDATE products
      SET stock_amount = CASE WHEN in_stock THEN 1 ELSE 0 END
      WHERE stock_amount IS NULL;
    `);

    await client.query(`
      UPDATE products
      SET stock_amount = 0, in_stock = FALSE
      WHERE stock_amount < 0;
    `);

    await client.query(`
      ALTER TABLE products
      ALTER COLUMN stock_amount SET DEFAULT 0;
    `);

    await client.query(`
      ALTER TABLE products
      ALTER COLUMN stock_amount SET NOT NULL;
    `);

    await client.query(`
      UPDATE products
      SET in_stock = stock_amount > 0;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        page TEXT NULL,
        resolved BOOLEAN NOT NULL DEFAULT FALSE,
        reply TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        logo_url TEXT NOT NULL DEFAULT '/logo.png',
        hero_images TEXT[] NOT NULL DEFAULT ARRAY['/hero.png'],
        contact_email TEXT NOT NULL DEFAULT 'info@biopak.ye',
        contact_phone TEXT NOT NULL DEFAULT '+967 1 234 567',
        address_en TEXT NOT NULL DEFAULT 'Sana''a, Yemen',
        address_ar TEXT NOT NULL DEFAULT 'صنعاء، اليمن',
        tagline_en TEXT NOT NULL DEFAULT 'Sustainable packaging for a greener tomorrow.',
        tagline_ar TEXT NOT NULL DEFAULT 'تغليف مستدام لغد أكثر اخضرارًا.',
        page_content JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE site_settings
      ADD COLUMN IF NOT EXISTS hero_images TEXT[];
    `);

    await client.query(`
      ALTER TABLE site_settings
      ADD COLUMN IF NOT EXISTS page_content JSONB;
    `);

    await client.query(`
      UPDATE site_settings
      SET hero_images = ARRAY['/hero.png']
      WHERE hero_images IS NULL;
    `);

    await client.query(
      `
        UPDATE site_settings
        SET page_content = $1::jsonb
        WHERE page_content IS NULL;
      `,
      [JSON.stringify(defaultPageContent)],
    );

    await client.query(`
      ALTER TABLE site_settings
      ALTER COLUMN hero_images SET DEFAULT ARRAY['/hero.png'];
    `);

    await client.query(`
      ALTER TABLE site_settings
      ALTER COLUMN page_content SET DEFAULT '${defaultPageContentSql}'::jsonb;
    `);

    await client.query(`
      ALTER TABLE site_settings
      ALTER COLUMN hero_images SET NOT NULL;
    `);

    await client.query(`
      ALTER TABLE site_settings
      ALTER COLUMN page_content SET NOT NULL;
    `);

    await client.query(
      "INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;",
    );

    const productCountResult = await client.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM products;",
    );

    const productCount = Number(productCountResult.rows[0]?.count ?? "0");
    if (productCount === 0) {
      for (const product of seedProducts) {
        await client.query(
          `
            INSERT INTO products (
              slug, name_en, name_ar, description_en, description_ar,
              price, unit_en, unit_ar, image_url, category_en, category_ar, stock_amount, in_stock
            )
            VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, $9, $10, $11, $12, $13
            )
          `,
          [
            product.slug,
            product.name_en,
            product.name_ar,
            product.description_en,
            product.description_ar,
            product.price,
            product.unit_en,
            product.unit_ar,
            product.image_url,
            product.category_en,
            product.category_ar,
            product.stock_amount,
            product.in_stock,
          ],
        );
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function ensureDatabaseReady() {
  if (!bootstrapPromise) {
    bootstrapPromise = runBootstrap();
    bootstrapPromise.catch(() => {
      bootstrapPromise = null;
    });
  }
  return bootstrapPromise;
}
