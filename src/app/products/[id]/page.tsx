import { SiteShell } from "@/components/site-shell";
import { ProductDetailContent } from "@/components/product-detail-content";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <SiteShell>
      <ProductDetailContent id={id} />
    </SiteShell>
  );
}

