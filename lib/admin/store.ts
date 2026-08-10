import "server-only";

/**
 * Trade data, read from Firestore through the Admin SDK.
 *
 * Reads are wrapped in React's `cache`, so the dashboard — which needs orders
 * for revenue, the queue, product performance and the size curve all at once —
 * pays for one query, not four.
 *
 * Orders are fetched as a rolling window rather than a whole collection scan;
 * `WINDOW_DAYS` is what every metric on the admin is measured over.
 */

import { cache } from "react";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb, stripUndefined } from "@/lib/firebase/server";
import { PRODUCTS_COLLECTION, getEntry } from "@/lib/catalogue";
import { cellsToMap, type Drop, type Order, type OrderStatus, type StockCell, type Subscriber } from "./types";
import type { Product } from "@/lib/products";

export * from "./types";

export const WINDOW_DAYS = 45;

export const ORDERS_COLLECTION = "orders";
export const SUBSCRIBERS_COLLECTION = "subscribers";
export const DROPS_COLLECTION = "drops";

const DAY = 86_400_000;

/** Firestore hands back Timestamps; the rest of the app speaks ISO strings. */
const toIso = (value: unknown): string => {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : new Date(0).toISOString();
};

/* --------------------------------- orders --------------------------------- */

export const getOrders = cache(async (): Promise<Order[]> => {
  const cutoff = Timestamp.fromMillis(Date.now() - WINDOW_DAYS * DAY);

  const snapshot = await adminDb
    .collection(ORDERS_COLLECTION)
    .where("placedAt", ">=", cutoff)
    .orderBy("placedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return { ...data, id: doc.id, placedAt: toIso(data.placedAt) } as Order;
  });
});

export async function getOrder(id: string): Promise<Order | null> {
  const doc = await adminDb.collection(ORDERS_COLLECTION).doc(id).get();
  if (!doc.exists) return null;

  const data = doc.data()!;
  return { ...data, id: doc.id, placedAt: toIso(data.placedAt) } as Order;
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  const ref = adminDb.collection(ORDERS_COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return null;

  await ref.update({ status, updatedAt: Timestamp.now() });
  return getOrder(id);
}

/* ------------------------------- subscribers ------------------------------ */

export const getSubscribers = cache(async (): Promise<Subscriber[]> => {
  const snapshot = await adminDb
    .collection(SUBSCRIBERS_COLLECTION)
    .orderBy("joinedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return { ...data, joinedAt: toIso(data.joinedAt) } as Subscriber;
  });
});

/**
 * Sign-ups are keyed by normalised email, so the same address joining twice
 * updates one row instead of making a second.
 */
export async function addSubscriber(input: {
  email: string;
  source: Subscriber["source"];
  city?: string;
}): Promise<{ created: boolean }> {
  const email = input.email.trim().toLowerCase();
  const ref = adminDb.collection(SUBSCRIBERS_COLLECTION).doc(email);
  const existing = await ref.get();

  if (existing.exists) return { created: false };

  await ref.set({
    email,
    source: input.source,
    city: input.city ?? "",
    converted: false,
    joinedAt: Timestamp.now(),
  });

  return { created: true };
}

/* ---------------------------------- drops --------------------------------- */

export const getDrops = cache(async (): Promise<Drop[]> => {
  const snapshot = await adminDb.collection(DROPS_COLLECTION).get();

  return snapshot.docs
    .map((doc) => ({ ...doc.data(), id: doc.id, date: toIso(doc.data().date) }) as Drop)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

/* -------------------------------- products -------------------------------- */

export type ProductPatch = {
  price?: number;
  status?: Product["status"] | null;
  collection?: Product["collection"];
  colorway?: string;
  description?: string;
  /** Primary shot. Already uploaded — this is the URL to point at. */
  image?: string;
  /** Alt text for the primary shot. */
  alt?: string;
  /** Hover shot. Decorative on the storefront, so it carries no alt. */
  imageAlt?: string;
  /** Size → units on the shelf. */
  stock?: Record<string, number>;
};

export async function patchProduct(slug: string, patch: ProductPatch) {
  const entry = await getEntry(slug);
  if (!entry) return null;

  const update: Record<string, unknown> = stripUndefined({
    price: patch.price,
    collection: patch.collection,
    colorway: patch.colorway,
    description: patch.description,
    image: patch.image,
    alt: patch.alt,
    imageAlt: patch.imageAlt,
  });

  // `null` clears the badge; `undefined` means "leave it alone".
  if (patch.status !== undefined) {
    update.status = patch.status ?? null;
  }

  if (patch.stock) {
    const cells: StockCell[] = entry.stock.map((cell) => {
      const next = patch.stock?.[cell.size];
      return next === undefined || !Number.isFinite(next)
        ? cell
        : { ...cell, stock: Math.max(0, Math.min(next, cell.run)) };
    });

    update.stock = cellsToMap(cells);
    // Keep the storefront's sold-out sizes in step with the shelf.
    update.soldOutSizes = cells.filter((c) => c.stock === 0).map((c) => c.size);
  }

  update.updatedAt = Timestamp.now();

  await adminDb.collection(PRODUCTS_COLLECTION).doc(slug).update(update);
  return { ...entry.product, ...update } as Product;
}

/**
 * A piece as it arrives from the create form. `soldOutSizes` is derived rather
 * than supplied, and stock comes as cells because a new run sets both the units
 * on the shelf and the size of the cut.
 */
export type NewProduct = Omit<Product, "soldOutSizes" | "status"> & {
  status: Product["status"] | null;
  stock: StockCell[];
};

/**
 * Writes a piece that doesn't exist yet.
 *
 * Returns null when the slug is already taken. The check runs inside a
 * transaction because the slug is the document id and the storefront's
 * permalink: two admins adding "Box Tee" at the same moment must not have one
 * silently overwrite the other's photography.
 */
export async function createProduct(input: NewProduct): Promise<Product | null> {
  const { slug, stock, ...fields } = input;
  const ref = adminDb.collection(PRODUCTS_COLLECTION).doc(slug);

  // `getCatalogue` orders by this field, so a document without one would be
  // written successfully and then never appear anywhere. New pieces land last.
  const last = await adminDb
    .collection(PRODUCTS_COLLECTION)
    .orderBy("order", "desc")
    .limit(1)
    .get();

  const order = last.empty ? 0 : Number(last.docs[0].data().order ?? 0) + 1;
  const soldOutSizes = stock.filter((c) => c.stock === 0).map((c) => c.size);

  const written = await adminDb.runTransaction(async (tx) => {
    if ((await tx.get(ref)).exists) return false;

    tx.set(ref, {
      ...stripUndefined(fields),
      status: input.status ?? null,
      soldOutSizes,
      stock: cellsToMap(stock),
      order,
      updatedAt: Timestamp.now(),
    });

    return true;
  });

  if (!written) return null;

  return {
    ...fields,
    slug,
    status: input.status ?? undefined,
    soldOutSizes,
  } as Product;
}
