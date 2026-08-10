import "server-only";

/**
 * The catalogue, read from Firestore.
 *
 * One document per piece in `products/{slug}`, carrying the storefront fields
 * plus a `stock` map of size → { stock, run }. Stock rides on the product
 * rather than in a subcollection because it is small, always wanted alongside
 * the piece, and updated in the same edit.
 *
 * Every reader goes through `fetchCatalogue`, which React's `cache` dedupes
 * for the life of one request — so a page that shows products, inventory and
 * sell-through costs a single Firestore read, not three.
 */

import { cache } from "react";
import { adminDb } from "./firebase/server";
import type { Product } from "./products";
import { mapToCells, type StockCell, type StockMap } from "./admin/types";

export type CatalogueEntry = {
  product: Product;
  stock: StockCell[];
};

type ProductDoc = Product & {
  stock?: StockMap;
  /** Preserves the order the collection was designed in. */
  order?: number;
};

export const PRODUCTS_COLLECTION = "products";

const fetchCatalogue = cache(async (): Promise<CatalogueEntry[]> => {
  const snapshot = await adminDb
    .collection(PRODUCTS_COLLECTION)
    .orderBy("order")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as ProductDoc;

    // Fields are picked rather than spread: a document also carries `stock`,
    // `order` and an `updatedAt` Timestamp, and a Timestamp is a class
    // instance — passing one to a Client Component is a hard error.
    const product: Product = {
      slug: doc.id,
      name: data.name,
      subtitle: data.subtitle,
      price: data.price,
      compareAt: data.compareAt,
      collection: data.collection,
      colorway: data.colorway,
      image: data.image,
      alt: data.alt,
      imageAlt: data.imageAlt,
      fabric: data.fabric,
      weightGsm: data.weightGsm,
      sizes: data.sizes ?? [],
      soldOutSizes: data.soldOutSizes ?? [],
      status: data.status ?? undefined,
      description: data.description,
      details: data.details ?? [],
    };

    return { product, stock: mapToCells(data.stock ?? {}, product.sizes) };
  });
});

export const getCatalogue = fetchCatalogue;

export async function getProducts(): Promise<Product[]> {
  return (await fetchCatalogue()).map((entry) => entry.product);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const entry = (await fetchCatalogue()).find((e) => e.product.slug === slug);
  return entry?.product ?? null;
}

export async function getEntry(slug: string): Promise<CatalogueEntry | null> {
  return (await fetchCatalogue()).find((e) => e.product.slug === slug) ?? null;
}

export async function getInventory(slug: string): Promise<StockCell[]> {
  return (await getEntry(slug))?.stock ?? [];
}
