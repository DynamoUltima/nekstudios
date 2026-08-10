import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AdminPageHead } from "@/components/admin/admin-shell";
import {
  EmptyState,
  Meter,
  Panel,
  Pill,
  RowLink,
  Table,
  Td,
  Th,
  Tr,
} from "@/components/admin/ui";
import { fmtMoney, fmtNumber } from "@/lib/admin/format";
import { productPerformance } from "@/lib/admin/metrics";
import { getCatalogue } from "@/lib/catalogue";

export const metadata: Metadata = { title: "Products" };

const COLLECTIONS = ["THE DROP", "MOVEMENT", "FABRIC", "ARCHIVE"] as const;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const active = (c ?? "").toUpperCase();

  const [performance, catalogue] = await Promise.all([
    productPerformance(),
    getCatalogue(),
  ]);

  const rows = active
    ? performance.filter((p) => p.collection === active)
    : performance;

  const byslug = new Map(catalogue.map((e) => [e.product.slug, e.product]));
  const catalogueValue = performance.reduce(
    (n, p) => n + p.stock * p.price,
    0,
  );

  return (
    <>
      <AdminPageHead
        eyebrow="Catalogue"
        title="Pieces"
        lede={`${performance.length} ${performance.length === 1 ? "piece" : "pieces"} in the collection. Price, badge and stock all write straight through to the storefront.`}
        actions={
          <Link
            href="/admin/products/new"
            className="label border border-ink bg-ink px-4 py-3 text-bone transition-colors hover:bg-red"
          >
            New piece
          </Link>
        }
      />

      <div className="px-5 py-8 md:px-9">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <nav className="flex flex-wrap gap-2">
            <Link
              href="/admin/products"
              className={`label border px-4 py-2.5 transition-colors duration-200 ${
                !active
                  ? "border-ink bg-ink text-bone"
                  : "border-line text-ash hover:border-ink hover:text-ink"
              }`}
            >
              All
            </Link>
            {COLLECTIONS.map((collection) => (
              <Link
                key={collection}
                href={`/admin/products?c=${encodeURIComponent(collection.toLowerCase())}`}
                className={`label border px-4 py-2.5 transition-colors duration-200 ${
                  active === collection
                    ? "border-ink bg-ink text-bone"
                    : "border-line text-ash hover:border-ink hover:text-ink"
                }`}
              >
                {collection}
              </Link>
            ))}
          </nav>

          <p className="label text-ash">
            Stock on hand {fmtMoney(catalogueValue)} at retail
          </p>
        </div>

        <Panel
          title={active || "All pieces"}
          meta={`${rows.length} ${rows.length === 1 ? "piece" : "pieces"}`}
          bleed
        >
          {rows.length === 0 ? (
            active ? (
              <EmptyState
                title="Nothing in that collection"
                body="It is either between drops or archived."
                action={
                  <Link href="/admin/products" className="label text-red">
                    See everything →
                  </Link>
                }
              />
            ) : (
              <EmptyState
                title="No pieces yet"
                body="The catalogue is empty. Add the first piece, or run the seed to load the demo collection."
                action={
                  <Link href="/admin/products/new" className="label text-red">
                    Add a piece →
                  </Link>
                }
              />
            )
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Piece</Th>
                  <Th>Collection</Th>
                  <Th align="right">Price</Th>
                  <Th align="right">Stock</Th>
                  <Th>Sell-through</Th>
                  <Th>Flags</Th>
                  <Th align="right" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const product = byslug.get(row.slug);
                  return (
                    <Tr key={row.slug} href={`/admin/products/${row.slug}`}>
                      <Td>
                        <div className="flex items-center gap-4">
                          {product && (
                            <div className="relative hidden h-14 w-11 shrink-0 overflow-hidden bg-bone-2 sm:block">
                              <Image
                                src={product.image}
                                alt=""
                                fill
                                sizes="44px"
                                className="object-cover grayscale"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <RowLink
                              href={`/admin/products/${row.slug}`}
                              className="label"
                            >
                              {row.name}
                            </RowLink>
                            <span className="mt-1 block truncate text-xs text-ash">
                              {row.subtitle} · {product?.colorway}
                            </span>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <Pill tone="outline">{row.collection}</Pill>
                      </Td>
                      <Td align="right" numeric>
                        {fmtMoney(row.price)}
                      </Td>
                      <Td align="right" numeric>
                        {fmtNumber(row.stock)}
                        <span className="mt-1 block text-xs text-ash">
                          of {fmtNumber(row.run)} cut
                        </span>
                      </Td>
                      <Td className="w-48">
                        <Meter
                          value={row.sellThrough}
                          danger={row.sellThrough > 85}
                          label={`${row.name} sell-through`}
                        />
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-1.5">
                          {product?.status && (
                            <Pill tone={product.status === "NEW" ? "red" : "ink"}>
                              {product.status}
                            </Pill>
                          )}
                          {row.outOfSize.length > 0 && (
                            <Pill tone="quiet">
                              {row.outOfSize.join("/")} out
                            </Pill>
                          )}
                        </div>
                      </Td>
                      <Td align="right">
                        <RowLink
                          href={`/admin/products/${row.slug}`}
                          className="label text-ash"
                        >
                          Edit →
                        </RowLink>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Panel>
      </div>
    </>
  );
}
