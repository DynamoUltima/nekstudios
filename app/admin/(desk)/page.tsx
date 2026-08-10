import Link from "next/link";
import { AdminPageHead } from "@/components/admin/admin-shell";
import { RevenueChart } from "@/components/admin/revenue-chart";
import {
  EmptyState,
  Meter,
  Panel,
  RowLink,
  StatTile,
  StatusPill,
  Table,
  Td,
  Th,
  Tr,
} from "@/components/admin/ui";
import {
  fmtAgo,
  fmtCompactMoney,
  fmtMoney,
  fmtNumber,
  fmtPercent,
} from "@/lib/admin/format";
import {
  dailyRevenue,
  fulfilmentQueue,
  listStats,
  productPerformance,
  stockAlerts,
  summary,
} from "@/lib/admin/metrics";
import { getDrops } from "@/lib/admin/store";

export default async function AdminOverviewPage() {
  const [stats, series, queue, alerts, performance, list, drops] =
    await Promise.all([
      summary(14),
      dailyRevenue(14),
      fulfilmentQueue(),
      stockAlerts(8),
      productPerformance(),
      listStats(),
      getDrops(),
    ]);

  const nextDrop = drops.find((d) => d.status === "SCHEDULED");

  const daysToDrop = nextDrop
    ? Math.ceil(
        (new Date(nextDrop.date).getTime() - Date.now()) / 86_400_000,
      )
    : null;

  return (
    <>
      <AdminPageHead
        eyebrow="Overview"
        title="Studio desk"
        lede="Last fourteen days against the fourteen before them. The drop landed twelve days ago — the spike in the middle of the chart is it."
      />

      <div className="space-y-6 px-5 py-8 md:px-9">
        {/* Headline: one hero figure, three supports. */}
        <div className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            hero
            label="Revenue · 14 days"
            value={fmtCompactMoney(stats.revenue.value)}
            delta={stats.revenue.delta}
            note="vs prev. 14"
          />
          <StatTile
            label="Orders"
            value={fmtNumber(stats.orders.value)}
            delta={stats.orders.delta}
            note="vs prev. 14"
          />
          <StatTile
            label="Units shipped"
            value={fmtNumber(stats.units.value)}
            delta={stats.units.delta}
            note="vs prev. 14"
          />
          <StatTile
            label="Average order"
            value={fmtMoney(stats.aov.value)}
            delta={stats.aov.delta}
            note={`${fmtPercent(stats.returningRate)} returning`}
          />
        </div>

        <Panel
          title="Daily revenue"
          meta="Last 14 days"
          action={
            <span className="label text-ash">
              Peak day carries its value · today in red
            </span>
          }
        >
          <RevenueChart data={series} />
        </Panel>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          {/* Fulfilment queue — the reason anyone opens this page. */}
          <Panel
            title="Waiting on the studio"
            meta={`${queue.length} orders`}
            bleed
            action={
              <Link href="/admin/orders?status=NEW" className="label text-red">
                Open queue →
              </Link>
            }
          >
            {queue.length === 0 ? (
              <EmptyState
                title="Nothing to pack"
                body="Every order has left the building. Enjoy it."
              />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Customer</Th>
                    <Th>Pieces</Th>
                    <Th align="right">Total</Th>
                    <Th align="right">Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {queue.slice(0, 7).map((order) => (
                    <Tr key={order.id} href={`/admin/orders/${order.id}`}>
                      <Td>
                        <RowLink href={`/admin/orders/${order.id}`} className="label">
                          {order.id}
                        </RowLink>
                        <span className="label mt-1.5 block text-[0.5625rem] text-ash">
                          {fmtAgo(order.placedAt)}
                        </span>
                      </Td>
                      <Td>
                        {order.customer.name}
                        <span className="mt-1 block text-xs text-ash">
                          {order.customer.city}, {order.customer.country}
                        </span>
                      </Td>
                      <Td numeric>
                        {order.lines.reduce((n, l) => n + l.qty, 0)}
                      </Td>
                      <Td align="right" numeric>
                        {fmtMoney(order.total)}
                      </Td>
                      <Td align="right">
                        <StatusPill status={order.status} />
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Panel>

          <div className="space-y-6">
            {/* Stock alerts */}
            <Panel
              title="Sizes running out"
              meta={`${alerts.length} at or under 8`}
              bleed
              action={
                <Link href="/admin/inventory" className="label text-red">
                  Inventory →
                </Link>
              }
            >
              {alerts.length === 0 ? (
                <EmptyState title="Shelves are healthy" />
              ) : (
                <ul className="divide-y divide-line">
                  {alerts.slice(0, 6).map((alert) => (
                    <li
                      key={`${alert.slug}-${alert.size}`}
                      className="flex items-center justify-between gap-4 px-5 py-3.5"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${alert.slug}`}
                          className="label truncate transition-colors hover:text-red"
                        >
                          {alert.name}
                        </Link>
                        <p className="mt-1 text-xs text-ash">Size {alert.size}</p>
                      </div>
                      <span
                        className={`label shrink-0 tabular-nums ${
                          alert.stock === 0 ? "text-red" : "text-ink"
                        }`}
                      >
                        {alert.stock === 0 ? "Sold out" : `${alert.stock} left`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {/* Next drop */}
            {nextDrop && (
              <Panel title="Next drop" bleed>
                <div className="px-5 py-5">
                  <p className="label text-ash">{nextDrop.name}</p>
                  <p className="mt-4 text-5xl font-light tracking-[-0.03em]">
                    {daysToDrop !== null && daysToDrop >= 0
                      ? `${daysToDrop} days`
                      : "Live"}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-ash">
                    {nextDrop.note}
                  </p>
                  <Link
                    href="/admin/drops"
                    className="label mt-6 inline-block text-red"
                  >
                    Drop schedule →
                  </Link>
                </div>
              </Panel>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <Panel
            title="Pieces by revenue"
            meta="All time"
            bleed
            action={
              <Link href="/admin/products" className="label text-red">
                All pieces →
              </Link>
            }
          >
            <Table>
              <thead>
                <tr>
                  <Th>Piece</Th>
                  <Th align="right">Units</Th>
                  <Th align="right">Revenue</Th>
                  <Th>Sell-through</Th>
                </tr>
              </thead>
              <tbody>
                {performance.map((row) => (
                  <Tr key={row.slug} href={`/admin/products/${row.slug}`}>
                    <Td>
                      <RowLink
                        href={`/admin/products/${row.slug}`}
                        className="label"
                      >
                        {row.name}
                      </RowLink>
                      <span className="mt-1 block text-xs text-ash">
                        {row.subtitle}
                      </span>
                    </Td>
                    <Td align="right" numeric>
                      {fmtNumber(row.unitsSold)}
                    </Td>
                    <Td align="right" numeric>
                      {fmtMoney(row.revenue)}
                    </Td>
                    <Td className="w-48">
                      <Meter
                        value={row.sellThrough}
                        danger={row.sellThrough > 85}
                        label={`${row.name} sell-through ${Math.round(row.sellThrough)} percent`}
                      />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Panel>

          <Panel
            title="The list"
            meta={`${fmtNumber(list.total)} subscribers`}
            action={
              <Link href="/admin/subscribers" className="label text-red">
                Open →
              </Link>
            }
          >
            <div className="flex gap-10">
              <div>
                <p className="text-4xl font-light tracking-[-0.03em]">
                  {fmtNumber(list.last30)}
                </p>
                <p className="label mt-2.5 text-ash">Joined · 30 days</p>
              </div>
              <div>
                <p className="text-4xl font-light tracking-[-0.03em]">
                  {fmtPercent(list.convertedRate)}
                </p>
                <p className="label mt-2.5 text-ash">Have bought</p>
              </div>
            </div>

            <ul className="mt-8 space-y-3.5 border-t border-line pt-6">
              {list.bySource.map((source) => (
                <li key={source.source} className="flex items-center gap-4">
                  <span className="label w-24 shrink-0 text-ash">
                    {source.source}
                  </span>
                  <Meter
                    value={(source.count / list.total) * 100}
                    label={`${source.source}: ${source.count} subscribers`}
                  />
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
