import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHead } from "@/components/admin/admin-shell";
import { Meter, Panel, Pill, StatTile } from "@/components/admin/ui";
import { fmtDateLong, fmtMoney, fmtNumber } from "@/lib/admin/format";
import { productPerformance } from "@/lib/admin/metrics";
import { getDrops, getOrders, type Drop, type Order } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Drops" };

const DAY = 86_400_000;

const TONE: Record<Drop["status"], "red" | "ink" | "quiet"> = {
  LIVE: "red",
  SCHEDULED: "ink",
  ARCHIVED: "quiet",
};

/** Revenue booked on a drop's pieces since the day it went live. */
function dropRevenue(drop: Drop, orders: Order[]) {
  const from = new Date(drop.date).getTime();
  let revenue = 0;
  let units = 0;

  for (const order of orders) {
    if (order.status === "REFUNDED") continue;
    if (new Date(order.placedAt).getTime() < from) continue;
    for (const line of order.lines) {
      if (!drop.pieces.includes(line.slug)) continue;
      revenue += line.price * line.qty;
      units += line.qty;
    }
  }

  return { revenue, units };
}

export default async function DropsPage() {
  const [rows, drops, orders] = await Promise.all([
    productPerformance(),
    getDrops(),
    getOrders(),
  ]);

  const performance = new Map(rows.map((p) => [p.slug, p]));
  const live = drops.find((d) => d.status === "LIVE");
  const liveStats = live ? dropRevenue(live, orders) : null;
  const scheduled = drops.filter((d) => d.status === "SCHEDULED");

  const nextUp = scheduled
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const daysAway = nextUp
    ? Math.ceil((new Date(nextUp.date).getTime() - Date.now()) / DAY)
    : null;

  const ordered = [...drops].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <>
      <AdminPageHead
        eyebrow="Catalogue"
        title="Drops"
        lede="Small runs, fixed dates. A drop is live until the sizes run out — nothing gets reprinted, so the schedule is the plan."
      />

      <div className="space-y-6 px-5 py-8 md:px-9">
        <div className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            hero
            label="Live drop revenue"
            value={liveStats ? fmtMoney(liveStats.revenue) : "—"}
            note={live ? `since ${fmtDateLong(live.date)}` : undefined}
          />
          <StatTile
            label="Units moved"
            value={liveStats ? fmtNumber(liveStats.units) : "—"}
            note={live ? `of ${fmtNumber(live.runSize)} cut` : undefined}
          />
          <StatTile
            label="Next drop"
            value={daysAway !== null ? `${daysAway}d` : "—"}
            note={nextUp?.name}
          />
          <StatTile
            label="Scheduled"
            value={fmtNumber(scheduled.length)}
            note="on the calendar"
          />
        </div>

        <div className="space-y-6">
          {ordered.map((drop) => {
            const stats = dropRevenue(drop, orders);
            const upcoming = drop.status === "SCHEDULED";
            const days = Math.round(
              (new Date(drop.date).getTime() - Date.now()) / DAY,
            );

            return (
              <Panel
                key={drop.id}
                title={drop.name}
                meta={fmtDateLong(drop.date)}
                action={
                  <div className="flex items-center gap-2.5">
                    <Pill tone={TONE[drop.status]}>{drop.status}</Pill>
                    <span className="label text-ash">
                      {upcoming
                        ? `In ${Math.abs(days)} days`
                        : `${Math.abs(days)} days ago`}
                    </span>
                  </div>
                }
              >
                <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
                  <div>
                    <p className="text-sm leading-relaxed text-ash">{drop.note}</p>

                    <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-5">
                      <div>
                        <dt className="label text-ash">Run size</dt>
                        <dd className="mt-2 text-2xl font-light tracking-[-0.03em] tabular-nums">
                          {fmtNumber(drop.runSize)}
                        </dd>
                      </div>
                      <div>
                        <dt className="label text-ash">
                          {upcoming ? "Projected" : "Revenue"}
                        </dt>
                        <dd className="mt-2 text-2xl font-light tracking-[-0.03em] tabular-nums">
                          {upcoming ? "—" : fmtMoney(stats.revenue)}
                        </dd>
                      </div>
                      <div>
                        <dt className="label text-ash">Units</dt>
                        <dd className="mt-2 text-2xl font-light tracking-[-0.03em] tabular-nums">
                          {upcoming ? "—" : fmtNumber(stats.units)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <p className="label text-ash">Pieces in this drop</p>
                    <ul className="mt-4 divide-y divide-line border-y border-line">
                      {drop.pieces.map((slug) => {
                        const row = performance.get(slug);
                        if (!row) return null;

                        return (
                          <li key={slug} className="py-4">
                            <div className="flex items-center justify-between gap-4">
                              <Link
                                href={`/admin/products/${slug}`}
                                className="label transition-colors hover:text-red"
                              >
                                {row.name}
                              </Link>
                              <span className="label tabular-nums text-ash">
                                {fmtNumber(row.stock)} left
                              </span>
                            </div>
                            <div className="mt-3">
                              <Meter
                                value={row.sellThrough}
                                danger={row.sellThrough > 85}
                                label={`${row.name} sell-through`}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>

        <p className="label text-ash">
          Drops live in the <code className="font-mono">drops</code> collection.
          Scheduling a new one means adding a document — there is no editor for
          them yet.
        </p>
      </div>
    </>
  );
}
