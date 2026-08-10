/**
 * Shapes shared by the seed generator, the Firestore store and the pages.
 *
 * Nothing here touches the Admin SDK, so the product forms — which run in the
 * browser — can import these lists rather than keeping their own copy that
 * drifts from what the Server Action will accept.
 */

import type { Product } from "@/lib/products";

export const COLLECTIONS: Product["collection"][] = [
  "THE DROP",
  "MOVEMENT",
  "FABRIC",
  "ARCHIVE",
];

export const BADGES: NonNullable<Product["status"]>[] = [
  "NEW",
  "LOW STOCK",
  "SOLD OUT",
  "RESTOCK",
];

/**
 * Every size the studio cuts. A new piece picks from this ladder; a size left
 * at a run of zero simply isn't part of that piece.
 */
export const SIZE_LADDER = ["XS", "S", "M", "L", "XL", "XXL"] as const;

/**
 * A product's permalink, derived from its name.
 *
 * Lives here rather than beside the create action because the form previews the
 * slug as you type: a `"use server"` module can only export async functions, so
 * importing it from there would turn every keystroke into a round trip.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    // Strip the combining marks NFKD just split off, so "Bogé" → "boge".
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * `/admin/products/new` is the create form, so a piece may not claim that slug
 * — it would be listed but never editable.
 */
export const RESERVED_SLUGS = new Set(["new"]);

export const ORDER_STATUSES = [
  "NEW",
  "PACKING",
  "SHIPPED",
  "DELIVERED",
  "REFUNDED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderLine = {
  slug: string;
  name: string;
  subtitle: string;
  size: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  /** ISO string. Stored in Firestore as a Timestamp and converted on read. */
  placedAt: string;
  status: OrderStatus;
  channel: "WEB" | "EARLY ACCESS" | "POPUP";
  customer: {
    name: string;
    email: string;
    city: string;
    country: string;
    /** Orders placed before this one, all time. */
    priorOrders: number;
  };
  lines: OrderLine[];
  shipping: number;
  subtotal: number;
  total: number;
};

export type SubscriberSource = "FOOTER" | "NEWSLETTER" | "POPUP" | "CHECKOUT";

export type Subscriber = {
  email: string;
  joinedAt: string;
  source: SubscriberSource;
  city: string;
  /** Has bought at least once. */
  converted: boolean;
};

export type StockCell = {
  size: string;
  /** Units left on the shelf. */
  stock: number;
  /** Units cut for the run — sell-through is measured against this. */
  run: number;
};

/** How stock rides along on a product document. */
export type StockMap = Record<string, { stock: number; run: number }>;

export type Drop = {
  id: string;
  name: string;
  date: string;
  status: "LIVE" | "SCHEDULED" | "ARCHIVED";
  pieces: string[];
  runSize: number;
  note: string;
};

export const cellsToMap = (cells: StockCell[]): StockMap =>
  Object.fromEntries(
    cells.map((c) => [c.size, { stock: c.stock, run: c.run }]),
  );

/** Ordered by the product's own size list, so the UI reads XS → XXL. */
export const mapToCells = (map: StockMap, sizes: string[]): StockCell[] =>
  sizes
    .filter((size) => map[size])
    .map((size) => ({ size, ...map[size] }));
