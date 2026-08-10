import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHead } from "@/components/admin/admin-shell";
import { Meter, Panel, StatTile, Table, Td, Th, Tr } from "@/components/admin/ui";
import { fmtMoney, fmtNumber, fmtPercent } from "@/lib/admin/format";
import { productPerformance, sizeDemand } from "@/lib/admin/metrics";
import { getCatalogue } from "@/lib/catalogue";

export const metadata: Metadata = { title: "Inventory" };

/** Every size the studio cuts, in wearing order. */
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/**
 * Sequential ink ramp — one hue, light to dark, darker means deeper stock.
 * Zero is the exception: it leaves the ramp and goes red, because an empty
 * size is a state to act on, not a quantity to read.
 */
function cellStyle(stock: number, run: number) {
  if (stock === 0) return null;
  const ratio = Math.min(1, stock / Math.max(1, run));
  const steps = [8, 18, 32, 50, 70];
  const step = steps[Math.min(steps.length - 1, Math.floor(ratio * steps.length))];
  return {
    background: `color-mix(in oklab, var(--color-ink) ${step}%, var(--color-paper))`,
    color: step >= 50 ? "var(--color-bone)" : "var(--color-ink)",
  };
}

export default async function InventoryPage() {
  const [performance, catalogue, demandBySize] = await Promise.all([
    productPerformance(),
    getCatalogue(),
    sizeDemand(),
  ]);

  const totalUnits = performance.reduce((n, p) => n + p.stock, 0);
  const retailValue = performance.reduce((n, p) => n + p.stock * p.price, 0);
  const soldOutSizes = performance.reduce((n, p) => n + p.outOfSize.length, 0);
  const avgSellThrough =
    performance.reduce((n, p) => n + p.sellThrough, 0) / (performance.length || 1);

  // `demandBySize` is what actually sold across the whole catalogue — the
  // number that decides the size curve on the next cut.
  const peakDemand = Math.max(1, ...demandBySize.values());

  return (
    <>
      <AdminPageHead
        eyebrow="Catalogue"
        title="Inventory"
        lede="Units left on the shelf, size by size. Darker means deeper stock; red means the size is gone and the storefront has stopped offering it."
      />

      <div className="space-y-6 px-5 py-8 md:px-9">
        <div className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Units on hand" value={fmtNumber(totalUnits)} />
          <StatTile label="Value at retail" value={fmtMoney(retailValue)} />
          <StatTile
            label="Sizes sold out"
            value={fmtNumber(soldOutSizes)}
            note={soldOutSizes > 0 ? "across the catalogue" : "shelves healthy"}
          />
          <StatTile
            label="Average sell-through"
            value={fmtPercent(avgSellThrough)}
            note="of the cut runs"
          />
        </div>

        <Panel
          title="Stock matrix"
          meta="Units left"
          bleed
          action={
            <div className="flex items-center gap-2.5">
              <span className="label text-ash">Low</span>
              <span className="flex">
                {[8, 18, 32, 50, 70].map((step) => (
                  <span
                    key={step}
                    className="h-3 w-6"
                    style={{
                      background: `color-mix(in oklab, var(--color-ink) ${step}%, var(--color-paper))`,
                    }}
                  />
                ))}
              </span>
              <span className="label text-ash">Deep</span>
              <span className="ml-3 h-3 w-6 bg-red" />
              <span className="label text-ash">Out</span>
            </div>
          }
        >
          <Table>
            <thead>
              <tr>
                <Th>Piece</Th>
                {SIZES.map((size) => (
                  <Th key={size} align="right">
                    {size}
                  </Th>
                ))}
                <Th align="right">On hand</Th>
              </tr>
            </thead>
            <tbody>
              {catalogue.map(({ product, stock: cells }) => {
                const onHand = cells.reduce((n, c) => n + c.stock, 0);

                return (
                  <Tr key={product.slug} href={`/admin/products/${product.slug}`}>
                    <Td>
                      <Link
                        href={`/admin/products/${product.slug}`}
                        className="label transition-colors hover:text-red"
                      >
                        {product.name}
                      </Link>
                      <span className="mt-1 block text-xs text-ash">
                        {product.subtitle}
                      </span>
                    </Td>

                    {SIZES.map((size) => {
                      const cell = cells.find((c) => c.size === size);

                      if (!cell) {
                        return (
                          <Td key={size} align="right" className="text-ash">
                            <span aria-label={`Size ${size} not cut`}>—</span>
                          </Td>
                        );
                      }

                      const style = cellStyle(cell.stock, cell.run);

                      return (
                        <Td key={size} align="right" numeric className="p-0">
                          <span
                            className={`label flex h-14 items-center justify-end px-4 tabular-nums ${
                              style ? "" : "bg-red text-white"
                            }`}
                            style={style ?? undefined}
                            title={`${product.name} · ${size} · ${cell.stock} of ${cell.run} cut`}
                          >
                            {cell.stock === 0 ? "OUT" : cell.stock}
                          </span>
                        </Td>
                      );
                    })}

                    <Td align="right" numeric className="label">
                      {fmtNumber(onHand)}
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Panel>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Size curve" meta="Units sold, all pieces">
            <p className="text-sm leading-relaxed text-ash">
              The curve to cut against next run. M and L carry the collection —
              XS and XXL are being cut deeper than they sell.
            </p>
            <ul className="mt-7 space-y-3.5">
              {SIZES.map((size) => (
                <li key={size} className="flex items-center gap-4">
                  <span className="label w-12 shrink-0 text-ash">{size}</span>
                  <Meter
                    value={((demandBySize.get(size) ?? 0) / peakDemand) * 100}
                    label={`Size ${size}: ${demandBySize.get(size) ?? 0} units sold`}
                  />
                  <span className="label w-14 shrink-0 text-right tabular-nums">
                    {fmtNumber(demandBySize.get(size) ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Runs at risk" meta="Over 85% sold through" bleed>
            <ul className="divide-y divide-line">
              {performance
                .filter((p) => p.sellThrough > 70)
                .map((row) => (
                  <li key={row.slug} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <Link
                        href={`/admin/products/${row.slug}`}
                        className="label transition-colors hover:text-red"
                      >
                        {row.name}
                      </Link>
                      <span className="label tabular-nums text-ash">
                        {fmtNumber(row.stock)} left
                      </span>
                    </div>
                    <div className="mt-3">
                      <Meter value={row.sellThrough} danger={row.sellThrough > 85} />
                    </div>
                    {row.outOfSize.length > 0 && (
                      <p className="label mt-3 text-red">
                        {row.outOfSize.join(", ")} sold out
                      </p>
                    )}
                  </li>
                ))}
              {performance.filter((p) => p.sellThrough > 70).length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-ash">
                  No run is close to selling out.
                </li>
              )}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
