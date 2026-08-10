import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHead } from "@/components/admin/admin-shell";
import {
  AdminButton,
  Panel,
  Pill,
  StatusPill,
  Table,
  Td,
  Th,
  Tr,
} from "@/components/admin/ui";
import { updateOrderStatus } from "@/lib/admin/actions";
import { fmtAgo, fmtDateLong, fmtMoney, fmtTime } from "@/lib/admin/format";
import { getOrder, type OrderStatus } from "@/lib/admin/store";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id.toUpperCase()}` };
}

/** The fulfilment path. Refunds sit outside it. */
const TIMELINE: OrderStatus[] = ["NEW", "PACKING", "SHIPPED", "DELIVERED"];

/** What the studio can do next, given where the order is. */
const NEXT_ACTIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["PACKING", "REFUNDED"],
  PACKING: ["SHIPPED", "REFUNDED"],
  SHIPPED: ["DELIVERED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
  REFUNDED: ["NEW"],
};

const ACTION_LABEL: Record<OrderStatus, string> = {
  NEW: "Reopen order",
  PACKING: "Start packing",
  SHIPPED: "Mark shipped",
  DELIVERED: "Mark delivered",
  REFUNDED: "Refund order",
};

export default async function OrderDetailPage({ params }: Params) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  const units = order.lines.reduce((n, l) => n + l.qty, 0);
  const stage = TIMELINE.indexOf(order.status);
  const refunded = order.status === "REFUNDED";

  return (
    <>
      <AdminPageHead
        eyebrow={
          <>
            <Link href="/admin/orders" className="transition-colors hover:text-ink">
              Orders
            </Link>
            {" · "}
            {fmtAgo(order.placedAt)}
          </>
        }
        title={order.id}
        lede={`${fmtDateLong(order.placedAt)} at ${fmtTime(order.placedAt)} · ${units} ${
          units === 1 ? "piece" : "pieces"
        } · ${order.channel.toLowerCase()}`}
        actions={
          <form action={updateOrderStatus} className="flex flex-wrap gap-2.5">
            <input type="hidden" name="id" value={order.id} />
            {NEXT_ACTIONS[order.status].map((next, i) => (
              <AdminButton
                key={next}
                name="status"
                value={next}
                type="submit"
                variant={
                  next === "REFUNDED" ? "quiet" : i === 0 ? "solid" : "outline"
                }
              >
                {ACTION_LABEL[next]}
              </AdminButton>
            ))}
          </form>
        }
      />

      <div className="grid gap-6 px-5 py-8 md:px-9 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Panel title="Pieces" meta={`${units} in the box`} bleed>
            <Table>
              <thead>
                <tr>
                  <Th>Piece</Th>
                  <Th>Size</Th>
                  <Th align="right">Qty</Th>
                  <Th align="right">Unit</Th>
                  <Th align="right">Line</Th>
                </tr>
              </thead>
              <tbody>
                {order.lines.map((line) => (
                  <Tr key={`${line.slug}-${line.size}`}>
                    <Td>
                      <Link
                        href={`/admin/products/${line.slug}`}
                        className="label transition-colors hover:text-red"
                      >
                        {line.name}
                      </Link>
                      <span className="mt-1 block text-xs text-ash">
                        {line.subtitle}
                      </span>
                    </Td>
                    <Td>
                      <Pill tone="outline">{line.size}</Pill>
                    </Td>
                    <Td align="right" numeric>
                      {line.qty}
                    </Td>
                    <Td align="right" numeric>
                      {fmtMoney(line.price)}
                    </Td>
                    <Td align="right" numeric>
                      {fmtMoney(line.price * line.qty)}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>

            <dl className="ml-auto max-w-sm space-y-3 px-5 py-5 text-sm">
              <div className="flex justify-between gap-6">
                <dt className="label text-ash">Subtotal</dt>
                <dd className="tabular-nums">{fmtMoney(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="label text-ash">Shipping</dt>
                <dd className="tabular-nums">
                  {order.shipping === 0 ? "Free" : fmtMoney(order.shipping)}
                </dd>
              </div>
              <div className="flex justify-between gap-6 border-t border-line pt-3">
                <dt className="label">Total</dt>
                <dd
                  className={`label tabular-nums ${refunded ? "text-ash line-through" : ""}`}
                >
                  {fmtMoney(order.total)}
                </dd>
              </div>
              {refunded && (
                <p className="label text-right text-red">Refunded in full</p>
              )}
            </dl>
          </Panel>

          <Panel title="Fulfilment">
            {refunded ? (
              <p className="text-sm leading-relaxed text-ash">
                This order was refunded and is out of the fulfilment path.
                Reopening it puts it back at the top of the queue.
              </p>
            ) : (
              <ol className="grid gap-px bg-line sm:grid-cols-4">
                {TIMELINE.map((step, i) => {
                  const done = i <= stage;
                  return (
                    <li
                      key={step}
                      className={`px-5 py-5 ${done ? "bg-ink text-bone" : "bg-paper"}`}
                    >
                      <p
                        className={`label ${done ? "text-bone/50" : "text-ash"}`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <p className="label mt-3">{step}</p>
                      <p
                        className={`label mt-2 text-[0.5625rem] ${
                          done ? "text-red" : "text-ash"
                        }`}
                      >
                        {i < stage ? "Done" : i === stage ? "Current" : "Waiting"}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Status">
            <div className="flex items-center justify-between gap-4">
              <StatusPill status={order.status} />
              <span className="label text-ash">
                Placed {fmtAgo(order.placedAt)}
              </span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-ash">
              Status changes write to the in-memory store and revalidate the
              order, the queue and the overview.
            </p>
          </Panel>

          <Panel title="Customer">
            <p className="label">{order.customer.name}</p>
            <p className="mt-2.5 text-sm break-all text-ash">
              {order.customer.email}
            </p>

            <dl className="mt-6 space-y-3.5 border-t border-line pt-5 text-sm">
              <div className="flex justify-between gap-6">
                <dt className="label text-ash">City</dt>
                <dd>
                  {order.customer.city}, {order.customer.country}
                </dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="label text-ash">Channel</dt>
                <dd>{order.channel}</dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="label text-ash">Prior orders</dt>
                <dd className="tabular-nums">{order.customer.priorOrders}</dd>
              </div>
            </dl>

            {order.customer.priorOrders > 0 && (
              <p className="label mt-6 border-t border-line pt-5 text-red">
                Returning customer
              </p>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
