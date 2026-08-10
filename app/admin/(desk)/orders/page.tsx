import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHead } from "@/components/admin/admin-shell";
import {
  AdminButton,
  EmptyState,
  Panel,
  Pill,
  RowLink,
  StatusPill,
  Table,
  Td,
  Th,
  Tr,
  inputClass,
} from "@/components/admin/ui";
import { fmtAgo, fmtDate, fmtMoney, fmtNumber, fmtTime } from "@/lib/admin/format";
import { ORDER_STATUSES, getOrders, type Order, type OrderStatus } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Orders" };

const PER_PAGE = 25;

function matches(order: Order, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    order.id.toLowerCase().includes(q) ||
    order.customer.name.toLowerCase().includes(q) ||
    order.customer.email.toLowerCase().includes(q) ||
    order.customer.city.toLowerCase().includes(q) ||
    order.lines.some((line) => line.name.toLowerCase().includes(q))
  );
}

function href(params: { status?: string; q?: string; page?: number }) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `/admin/orders?${qs}` : "/admin/orders";
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status, q = "", page = "1" } = await searchParams;

  const activeStatus = ORDER_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : undefined;

  const all = await getOrders();
  const filtered = all.filter(
    (order) =>
      (!activeStatus || order.status === activeStatus) && matches(order, q),
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(Math.max(1, Number(page) || 1), pageCount);
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const counts = ORDER_STATUSES.map((s) => ({
    status: s,
    count: all.filter((o) => o.status === s).length,
  }));

  const revenue = filtered.reduce(
    (n, o) => n + (o.status === "REFUNDED" ? 0 : o.total),
    0,
  );

  return (
    <>
      <AdminPageHead
        eyebrow="Trade"
        title="Orders"
        lede="Every order from the last forty-five days. Filter by state, or search by order number, customer, city or piece."
      />

      <div className="px-5 py-8 md:px-9">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* Status filter. Plain links, so a filtered view is a shareable URL. */}
          <nav className="flex flex-wrap gap-2">
            <Link
              href={href({ q })}
              className={`label border px-4 py-2.5 transition-colors duration-200 ${
                !activeStatus
                  ? "border-ink bg-ink text-bone"
                  : "border-line text-ash hover:border-ink hover:text-ink"
              }`}
            >
              All
              <span className="ml-2 tabular-nums opacity-60">{all.length}</span>
            </Link>

            {counts.map(({ status: s, count }) => (
              <Link
                key={s}
                href={href({ status: s, q })}
                className={`label border px-4 py-2.5 transition-colors duration-200 ${
                  activeStatus === s
                    ? "border-ink bg-ink text-bone"
                    : "border-line text-ash hover:border-ink hover:text-ink"
                }`}
              >
                {s}
                <span className="ml-2 tabular-nums opacity-60">{count}</span>
              </Link>
            ))}
          </nav>

          {/* GET form — works with JavaScript off, and leaves a URL behind. */}
          <form action="/admin/orders" className="flex gap-2">
            {activeStatus && (
              <input type="hidden" name="status" value={activeStatus} />
            )}
            <label htmlFor="order-search" className="sr-only">
              Search orders
            </label>
            <input
              id="order-search"
              name="q"
              defaultValue={q}
              placeholder="Order, name, city, piece"
              className={`${inputClass} w-64`}
            />
            <AdminButton type="submit" variant="outline">
              Search
            </AdminButton>
          </form>
        </div>

        <Panel
          title={activeStatus ? `${activeStatus} orders` : "All orders"}
          meta={`${fmtNumber(filtered.length)} shown · ${fmtMoney(revenue)} net`}
          bleed
        >
          {rows.length === 0 ? (
            <EmptyState
              title="No orders match"
              body="Loosen the filter or clear the search — the order is probably older than the window."
              action={
                <Link href="/admin/orders" className="label text-red">
                  Clear filters →
                </Link>
              }
            />
          ) : (
            <>
              <Table>
                <thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Placed</Th>
                    <Th>Customer</Th>
                    <Th>Pieces</Th>
                    <Th>Channel</Th>
                    <Th align="right">Total</Th>
                    <Th align="right">Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((order) => (
                    <Tr key={order.id} href={`/admin/orders/${order.id}`}>
                      <Td>
                        <RowLink href={`/admin/orders/${order.id}`} className="label">
                          {order.id}
                        </RowLink>
                      </Td>
                      <Td>
                        {fmtDate(order.placedAt)}
                        <span className="mt-1 block text-xs text-ash tabular-nums">
                          {fmtTime(order.placedAt)}
                        </span>
                      </Td>
                      <Td>
                        {order.customer.name}
                        <span className="mt-1 block text-xs text-ash">
                          {order.customer.city}, {order.customer.country}
                          {order.customer.priorOrders > 0 && " · returning"}
                        </span>
                      </Td>
                      <Td>
                        <span className="tabular-nums">
                          {order.lines.reduce((n, l) => n + l.qty, 0)}
                        </span>
                        <span className="mt-1 block truncate text-xs text-ash">
                          {order.lines
                            .map((l) => `${l.name} ${l.size}`)
                            .join(", ")}
                        </span>
                      </Td>
                      <Td>
                        <Pill tone={order.channel === "WEB" ? "quiet" : "outline"}>
                          {order.channel}
                        </Pill>
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

              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <p className="label text-ash">
                  Page {current} of {pageCount}
                </p>
                <div className="flex gap-2">
                  {current > 1 && (
                    <Link
                      href={href({ status: activeStatus, q, page: current - 1 })}
                      className="label border border-line px-4 py-2.5 text-ash transition-colors hover:border-ink hover:text-ink"
                    >
                      ← Newer
                    </Link>
                  )}
                  {current < pageCount && (
                    <Link
                      href={href({ status: activeStatus, q, page: current + 1 })}
                      className="label border border-line px-4 py-2.5 text-ash transition-colors hover:border-ink hover:text-ink"
                    >
                      Older →
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}
        </Panel>

        <p className="label mt-6 text-ash">
          Newest order {fmtAgo(all[0].placedAt)}
        </p>
      </div>
    </>
  );
}
