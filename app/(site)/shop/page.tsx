import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/page-head";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/motion";
import { TickerBar } from "@/components/sections";
import { getProducts } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "The Drop",
  description:
    "Collection '26 — six heavyweight cotton pieces, printed by hand in small runs.",
};

const FILTERS = [
  { label: "All", value: "" },
  { label: "The Drop", value: "the drop" },
  { label: "Movement", value: "movement" },
  { label: "Fabric", value: "fabric" },
  { label: "Archive", value: "archive" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const active = (c ?? "").toLowerCase();

  const all = await getProducts();
  const products = active
    ? all.filter((p) => p.collection.toLowerCase() === active)
    : all;

  return (
    <>
      <PageHead
        eyebrow="Collection '26"
        title={
          <>
            The
            <br />
            Drop
          </>
        }
        lede="Six pieces cut from heavyweight cotton and printed by hand. When a size is gone it stays gone — we don't reprint a run."
        accent
      />

      <TickerBar />

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-[110rem] px-5 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-line pb-6">
            <nav className="flex flex-wrap gap-2.5">
              {FILTERS.map((filter) => {
                const isActive = active === filter.value;
                return (
                  <Link
                    key={filter.label}
                    href={filter.value ? `/shop?c=${filter.value}` : "/shop"}
                    className={`label border px-4 py-2.5 transition-colors duration-300 ${
                      isActive
                        ? "border-ink bg-ink text-bone"
                        : "border-line text-ash hover:border-ink hover:text-ink"
                    }`}
                  >
                    {filter.label}
                  </Link>
                );
              })}
            </nav>

            <p className="label text-ash">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="py-28 text-center">
              <p className="display text-4xl">Nothing here yet</p>
              <p className="mt-5 text-sm text-ash">
                That collection is between drops.{" "}
                <Link href="/shop" className="text-red underline underline-offset-4">
                  See everything
                </Link>
              </p>
            </div>
          ) : (
            <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, i) => (
                <Reveal key={product.slug} delay={(i % 3) * 110}>
                  <ProductCard product={product} index={i} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
