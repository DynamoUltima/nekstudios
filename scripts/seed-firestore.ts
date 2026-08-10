/**
 * Load Firestore with the demo catalogue and trade history.
 *
 *   npm run seed
 *
 * Idempotent: every document is written at a known id, so re-running restores
 * the seeded state rather than duplicating it. Existing orders and subscribers
 * that the seed doesn't know about are left alone — pass --wipe to clear the
 * collections first.
 */

import { Timestamp, type WriteBatch } from "firebase-admin/firestore";
import { db, PROJECT_ID } from "./firebase-admin";
import { SEED_PRODUCTS } from "../lib/products";
import {
  seedDrops,
  seedInventory,
  seedOrders,
  seedSubscribers,
} from "../lib/admin/seed";
import { cellsToMap } from "../lib/admin/types";

const BATCH_LIMIT = 450; // Firestore caps a batch at 500 writes.

/** Commits in chunks so a large seed doesn't exceed the batch limit. */
async function commitAll(
  items: { ref: FirebaseFirestore.DocumentReference; data: object }[],
) {
  let batch: WriteBatch = db.batch();
  let pending = 0;

  for (const { ref, data } of items) {
    batch.set(ref, data);
    pending++;

    if (pending === BATCH_LIMIT) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
    }
  }

  if (pending > 0) await batch.commit();
}

async function wipe(collection: string) {
  const snapshot = await db.collection(collection).get();
  const refs = snapshot.docs.map((doc) => doc.ref);

  for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    for (const ref of refs.slice(i, i + BATCH_LIMIT)) batch.delete(ref);
    await batch.commit();
  }

  return refs.length;
}

async function main() {
  const shouldWipe = process.argv.includes("--wipe");

  console.log(`Seeding ${PROJECT_ID}${shouldWipe ? " (wiping first)" : ""}\n`);

  if (shouldWipe) {
    for (const collection of ["products", "orders", "subscribers", "drops"]) {
      const removed = await wipe(collection);
      console.log(`  cleared ${collection}: ${removed}`);
    }
    console.log("");
  }

  /* products — stock rides on the document */
  const inventory = seedInventory();

  await commitAll(
    SEED_PRODUCTS.map((product, index) => {
      const cells = inventory[product.slug] ?? [];
      const { slug, ...fields } = product;

      return {
        ref: db.collection("products").doc(slug),
        data: {
          ...fields,
          status: product.status ?? null,
          soldOutSizes: cells.filter((c) => c.stock === 0).map((c) => c.size),
          stock: cellsToMap(cells),
          order: index,
          updatedAt: Timestamp.now(),
        },
      };
    }),
  );
  console.log(`  products: ${SEED_PRODUCTS.length}`);

  /* orders */
  const orders = seedOrders();

  await commitAll(
    orders.map((order) => {
      const { id, placedAt, ...fields } = order;
      return {
        ref: db.collection("orders").doc(id),
        data: { ...fields, placedAt: Timestamp.fromDate(new Date(placedAt)) },
      };
    }),
  );
  console.log(`  orders: ${orders.length}`);

  /* subscribers — keyed by email so a repeat sign-up updates one row */
  const subscribers = seedSubscribers();

  await commitAll(
    subscribers.map((subscriber) => {
      const email = subscriber.email.toLowerCase();
      return {
        ref: db.collection("subscribers").doc(email),
        data: {
          ...subscriber,
          email,
          joinedAt: Timestamp.fromDate(new Date(subscriber.joinedAt)),
        },
      };
    }),
  );
  console.log(`  subscribers: ${subscribers.length}`);

  /* drops */
  const drops = seedDrops();

  await commitAll(
    drops.map((drop) => {
      const { id, date, ...fields } = drop;
      return {
        ref: db.collection("drops").doc(id),
        data: { ...fields, date: Timestamp.fromDate(new Date(date)) },
      };
    }),
  );
  console.log(`  drops: ${drops.length}`);

  console.log("\nDone.");
}

main().catch((error) => {
  console.error("\nSeed failed:", error);
  process.exit(1);
});
