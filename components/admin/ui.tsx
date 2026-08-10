/**
 * Admin primitives.
 *
 * Same ink on the same paper as the storefront — mono labels, hairline rules,
 * zero radius, one red — but the collage is gone. Nothing here rotates, tears,
 * or reveals on scroll: a page you read forty times a day should hold still.
 */

import Link from "next/link";
import { fmtDelta } from "@/lib/admin/format";
import type { OrderStatus } from "@/lib/admin/store";

/* --------------------------------- panel ---------------------------------- */

export function Panel({
  title,
  meta,
  action,
  children,
  className,
  bleed = false,
}: {
  title?: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Drop the body padding — tables run edge to edge. */
  bleed?: boolean;
}) {
  return (
    <section className={`border border-line bg-paper ${className ?? ""}`}>
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 bg-red" />
            <h2 className="label">{title}</h2>
            {meta && <span className="label text-ash">{meta}</span>}
          </div>
          {action}
        </header>
      )}
      <div className={bleed ? "" : "p-5"}>{children}</div>
    </section>
  );
}

/* ------------------------------- stat tiles ------------------------------- */

export function DeltaBadge({
  delta,
  /** Set false where a rise is bad — refunds, stockouts. */
  upIsGood = true,
}: {
  delta: number | null;
  upIsGood?: boolean;
}) {
  if (delta === null) {
    return <span className="label text-ash">—</span>;
  }

  const flat = Math.abs(delta) < 0.5;
  const good = upIsGood ? delta > 0 : delta < 0;

  return (
    <span
      className={`label tabular-nums ${
        flat ? "text-ash" : good ? "text-ink" : "text-red"
      }`}
    >
      {/* Direction is stated in the glyph as well as the colour. */}
      {!flat && (
        <span aria-hidden="true" className="mr-1">
          {delta > 0 ? "▲" : "▼"}
        </span>
      )}
      {fmtDelta(delta)}
    </span>
  );
}

export function StatTile({
  label,
  value,
  delta,
  note,
  upIsGood = true,
  hero = false,
}: {
  label: string;
  value: string;
  delta?: number | null;
  note?: string;
  upIsGood?: boolean;
  /** The one figure the page leads with. */
  hero?: boolean;
}) {
  return (
    <div
      className={`border border-line p-5 ${hero ? "bg-ink text-bone" : "bg-paper"}`}
    >
      <p className={`label ${hero ? "text-bone/50" : "text-ash"}`}>{label}</p>

      <p
        className={`mt-4 font-light tracking-[-0.03em] ${
          hero ? "text-5xl md:text-6xl" : "text-3xl"
        }`}
      >
        {value}
      </p>

      <div className="mt-4 flex items-center gap-2.5">
        {delta !== undefined &&
          (hero ? (
            <span className="label tabular-nums text-bone">
              {delta !== null && delta !== 0 && (
                <span aria-hidden="true" className="mr-1">
                  {delta > 0 ? "▲" : "▼"}
                </span>
              )}
              {fmtDelta(delta)}
            </span>
          ) : (
            <DeltaBadge delta={delta} upIsGood={upIsGood} />
          ))}
        {note && (
          <span className={`label ${hero ? "text-bone/40" : "text-ash"}`}>
            {note}
          </span>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- table ---------------------------------- */

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[42rem] border-collapse text-left">
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  align = "left",
  className,
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`label border-b border-line px-5 py-3.5 font-medium text-ash ${
        align === "right" ? "text-right" : "text-left"
      } ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className,
  numeric = false,
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  numeric?: boolean;
}) {
  return (
    <td
      className={`border-b border-line px-5 py-4 text-sm ${
        align === "right" ? "text-right" : "text-left"
      } ${numeric ? "tabular-nums" : ""} ${className ?? ""}`}
    >
      {children}
    </td>
  );
}

export function Tr({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  // Rows that lead somewhere carry the link on their cells, not the row — a
  // <tr> can't hold an <a>, and wrapping each cell keeps the whole row clickable.
  return (
    <tr className={`transition-colors duration-150 hover:bg-bone-2 ${href ? "group" : ""}`}>
      {children}
    </tr>
  );
}

/** Cell content that navigates — pairs with `<Tr href>` for full-row hover. */
export function RowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`block transition-colors duration-150 group-hover:text-red ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}

/* --------------------------------- pills ---------------------------------- */

/**
 * Status tone stays inside the brand's three inks. The label always spells the
 * state out, so colour is never the only channel.
 */
const ORDER_TONE: Record<OrderStatus, string> = {
  NEW: "bg-red text-white",
  PACKING: "bg-ink text-bone",
  SHIPPED: "border border-ink text-ink",
  DELIVERED: "border border-line text-ash",
  REFUNDED: "bg-bone-2 text-ash line-through",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`label inline-block px-2.5 py-1.5 text-[0.5625rem] ${ORDER_TONE[status]}`}
    >
      {status}
    </span>
  );
}

export function Pill({
  children,
  tone = "quiet",
}: {
  children: React.ReactNode;
  tone?: "quiet" | "ink" | "red" | "outline";
}) {
  const tones = {
    quiet: "bg-bone-2 text-ash",
    ink: "bg-ink text-bone",
    red: "bg-red text-white",
    outline: "border border-line text-ash",
  };

  return (
    <span
      className={`label inline-block px-2.5 py-1.5 text-[0.5625rem] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/* --------------------------------- meter ---------------------------------- */

/** Sell-through bar. Track is a lighter step of the fill, per the ramp. */
export function Meter({
  value,
  label,
  danger = false,
}: {
  /** 0–100. */
  value: number;
  label?: string;
  danger?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-3">
      <div
        className="h-1.5 w-full min-w-16 bg-bone-2"
        role="img"
        aria-label={label ?? `${Math.round(clamped)} percent`}
      >
        <div
          className={`h-full ${danger ? "bg-red" : "bg-ink"}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="label shrink-0 tabular-nums text-ash">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}

/* -------------------------------- controls -------------------------------- */

export function AdminButton({
  children,
  variant = "solid",
  className,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "solid" | "outline" | "red" | "quiet";
}) {
  const variants = {
    solid: "bg-ink text-bone hover:bg-red",
    outline: "border border-ink text-ink hover:bg-ink hover:text-bone",
    red: "bg-red text-white hover:bg-ink",
    quiet: "border border-line text-ash hover:border-ink hover:text-ink",
  };

  return (
    <button
      className={`label inline-flex items-center justify-center gap-2 px-4 py-3 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label block text-ash">
        {label}
      </label>
      <div className="mt-2.5">{children}</div>
      {error ? (
        <p className="label mt-2 text-[0.5625rem] text-red">{error}</p>
      ) : (
        hint && <p className="label mt-2 text-[0.5625rem] text-ash">{hint}</p>
      )}
    </div>
  );
}

export const inputClass =
  "w-full border border-line bg-bone px-4 py-3 text-sm text-ink transition-colors " +
  "placeholder:text-ash/70 focus:border-ink focus:outline-none";

/* ------------------------------- empty state ------------------------------ */

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-20 text-center">
      <p className="display text-3xl">{title}</p>
      {body && <p className="mx-auto mt-4 max-w-[40ch] text-sm text-ash">{body}</p>}
      {action && <div className="mt-7 flex justify-center">{action}</div>}
    </div>
  );
}
