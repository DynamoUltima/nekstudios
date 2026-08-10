import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHead } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
import { Meter, Panel } from "@/components/admin/ui";
import { fmtMoney, fmtNumber, fmtPercent } from "@/lib/admin/format";
import { productPerformance, sizeDemand } from "@/lib/admin/metrics";
import { getEntry } from "@/lib/catalogue";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);
  return { title: entry ? entry.product.name : "Piece not found" };
}

export default async function ProductEditorPage({ params }: Params) {
  const { slug } = await params;
  const entry = await getEntry(slug);

  if (!entry) notFound();

  const { product, stock } = entry;

  // Units sold per size tells you what to cut more of on the next run.
  const [allPerformance, demand] = await Promise.all([
    productPerformance(),
    sizeDemand(slug),
  ]);

  const performance = allPerformance.find((p) => p.slug === slug);
  const peakDemand = Math.max(1, ...demand.values());

  return (
    <>
      <AdminPageHead
        eyebrow={
          <>
            <Link
              href="/admin/products"
              className="transition-colors hover:text-ink"
            >
              Pieces
            </Link>
            {" · "}
            {product.collection}
          </>
        }
        title={product.name}
        lede={`${product.subtitle} · ${product.fabric} · ${product.weightGsm} GSM`}
        actions={
          <Link
            href={`/shop/${product.slug}`}
            className="label border border-ink px-4 py-3 transition-colors hover:bg-ink hover:text-bone"
          >
            View on store ↗
          </Link>
        }
      />

      <div className="space-y-6 px-5 py-8 md:px-9">
        {/* Performance sits above the editor: know the piece before changing it. */}
        {performance && (
          <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <Panel title="Performance" meta="All time">
              <div className="grid gap-8 sm:grid-cols-3">
                <div>
                  <p className="text-3xl font-light tracking-[-0.03em]">
                    {fmtNumber(performance.unitsSold)}
                  </p>
                  <p className="label mt-2.5 text-ash">Units sold</p>
                </div>
                <div>
                  <p className="text-3xl font-light tracking-[-0.03em]">
                    {fmtMoney(performance.revenue)}
                  </p>
                  <p className="label mt-2.5 text-ash">Revenue</p>
                </div>
                <div>
                  <p className="text-3xl font-light tracking-[-0.03em]">
                    {fmtPercent(performance.sellThrough)}
                  </p>
                  <p className="label mt-2.5 text-ash">Sell-through</p>
                </div>
              </div>

              <div className="mt-8 border-t border-line pt-6">
                <p className="label text-ash">Units sold by size</p>
                <ul className="mt-4 space-y-3">
                  {product.sizes.map((size) => (
                    <li key={size} className="flex items-center gap-4">
                      <span className="label w-12 shrink-0 text-ash">{size}</span>
                      <Meter
                        value={((demand.get(size) ?? 0) / peakDemand) * 100}
                        label={`Size ${size}: ${demand.get(size) ?? 0} units sold`}
                      />
                      <span className="label w-12 shrink-0 text-right tabular-nums">
                        {demand.get(size) ?? 0}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>

            <Panel title="On the storefront" bleed>
              <div className="grid grid-cols-2">
                <div className="relative aspect-4/5 bg-bone-2">
                  <Image
                    src={product.image}
                    alt={product.alt}
                    fill
                    sizes="(max-width: 1280px) 45vw, 20vw"
                    className="object-cover grayscale"
                  />
                </div>
                <div className="relative aspect-4/5 bg-bone-2">
                  <Image
                    src={product.imageAlt}
                    alt=""
                    fill
                    sizes="(max-width: 1280px) 45vw, 20vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="px-5 py-5">
                <p className="label">
                  {product.name}
                  <span className="ml-3 text-ash">{fmtMoney(product.price)}</span>
                </p>
                <p className="mt-2.5 text-xs text-ash">
                  {product.subtitle} · {product.colorway}
                </p>
                <p className="label mt-5 text-[0.5625rem] text-ash">
                  Primary and hover shot. Photography is swapped in the CMS, not
                  here.
                </p>
              </div>
            </Panel>
          </div>
        )}

        <ProductForm product={product} stock={stock} />
      </div>
    </>
  );
}
