/**
 * Demo data generator.
 *
 * Pure functions over a fixed PRNG — no Firestore, no side effects. The seed
 * script calls these once to populate the database; nothing at runtime does.
 * Re-running with the same seed produces the same catalogue, so a reseed is
 * repeatable rather than a new random world each time.
 */

import { SEED_PRODUCTS } from "@/lib/products";
import type { Drop, Order, OrderLine, OrderStatus, StockCell, Subscriber } from "./types";

/** mulberry32 — small, fast, identical on every run for a given seed. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = rng(20260126);

const pick = <T,>(list: readonly T[]) => list[Math.floor(random() * list.length)];
const between = (min: number, max: number) =>
  min + Math.floor(random() * (max - min + 1));

const FIRST = [
  "Ama", "Kojo", "Yuki", "Malik", "Ines", "Tobi", "Sena", "Nadia", "Ravi",
  "Elin", "Jonas", "Priya", "Diego", "Mei", "Kwame", "Lucia", "Omar", "Freya",
  "Noa", "Ilya", "Zara", "Bruno", "Hana", "Marcus", "Adaeze", "Theo", "Rin",
  "Selin", "Aya", "Nico",
];

const LAST = [
  "Osei", "Mensah", "Tanaka", "Diallo", "Ferreira", "Adeyemi", "Bergström",
  "Kaur", "Moreau", "Silva", "Okonkwo", "Nakamura", "Haddad", "Novak",
  "Lindqvist", "Boateng", "Rossi", "Yilmaz", "Weber", "Costa",
];

const PLACES = [
  { city: "Accra", country: "GH" },
  { city: "Tokyo", country: "JP" },
  { city: "Berlin", country: "DE" },
  { city: "New York", country: "US" },
  { city: "Lagos", country: "NG" },
  { city: "São Paulo", country: "BR" },
  { city: "Seoul", country: "KR" },
  { city: "London", country: "GB" },
  { city: "Paris", country: "FR" },
  { city: "Toronto", country: "CA" },
];

/** Midnight today — day buckets stay put for the length of a seed run. */
const TODAY = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();

const dayOffset = (days: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - days);
  return d;
};

export const WINDOW_DAYS = 45;

/** Fulfilment walks forward with age: today's orders are still unpacked. */
function statusForAge(daysOld: number): OrderStatus {
  if (random() > 0.975) return "REFUNDED";
  if (daysOld === 0) return random() > 0.35 ? "NEW" : "PACKING";
  if (daysOld === 1) return random() > 0.55 ? "PACKING" : "SHIPPED";
  if (daysOld <= 4) return random() > 0.3 ? "SHIPPED" : "DELIVERED";
  return "DELIVERED";
}

export function seedOrders(): Order[] {
  const orders: Order[] = [];
  let counter = 1041;

  for (let day = WINDOW_DAYS - 1; day >= 0; day--) {
    const date = dayOffset(day);
    const weekend = date.getDay() === 0 || date.getDay() === 6;

    // The drop landed 12 days ago — traffic spikes for about a week after.
    const dropBoost = day <= 12 && day >= 6 ? 2.4 : 1;
    const base = weekend ? 9 : 6;
    const count = Math.max(
      1,
      Math.round((base + random() * 7) * dropBoost * (day === 0 ? 0.55 : 1)),
    );

    for (let i = 0; i < count; i++) {
      const lineCount = random() > 0.74 ? 2 : 1;
      const lines: OrderLine[] = [];

      for (let l = 0; l < lineCount; l++) {
        const product = pick(SEED_PRODUCTS);
        if (lines.some((line) => line.slug === product.slug)) continue;
        lines.push({
          slug: product.slug,
          name: product.name,
          subtitle: product.subtitle,
          size: pick(product.sizes),
          qty: random() > 0.88 ? 2 : 1,
          price: product.price,
        });
      }

      const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
      // Free shipping over ₵150 — the storefront ticker promises it.
      const shipping = subtotal >= 150 ? 0 : 12;

      const first = pick(FIRST);
      const last = pick(LAST);
      const place = pick(PLACES);

      const placedAt = new Date(date);
      placedAt.setHours(between(7, 23), between(0, 59), 0, 0);

      orders.push({
        id: `EIK-${counter++}`,
        placedAt: placedAt.toISOString(),
        status: statusForAge(day),
        channel: random() > 0.82 ? "EARLY ACCESS" : random() > 0.96 ? "POPUP" : "WEB",
        customer: {
          name: `${first} ${last}`,
          email: `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, "")}@example.com`,
          city: place.city,
          country: place.country,
          priorOrders: random() > 0.72 ? between(1, 5) : 0,
        },
        lines,
        subtotal,
        shipping,
        total: subtotal + shipping,
      });
    }
  }

  return orders.reverse();
}

export function seedInventory(): Record<string, StockCell[]> {
  const inventory: Record<string, StockCell[]> = {};

  for (const product of SEED_PRODUCTS) {
    inventory[product.slug] = product.sizes.map((size) => {
      const run = between(40, 90);
      const soldOut = product.soldOutSizes?.includes(size);
      // Mid sizes move first — that's why M and L are the ones that run out.
      const pressure = size === "M" || size === "L" ? 0.86 : 0.55;
      const stock = soldOut
        ? 0
        : Math.max(0, Math.round(run * (1 - pressure * random())));
      return { size, stock, run };
    });
  }

  return inventory;
}

export function seedSubscribers(): Subscriber[] {
  const list: Subscriber[] = [];

  for (let day = 90; day >= 0; day--) {
    const spike = day <= 14 && day >= 8 ? 3 : 1;
    const count = Math.round((1 + random() * 3) * spike);

    for (let i = 0; i < count; i++) {
      const first = pick(FIRST);
      const last = pick(LAST);
      const place = pick(PLACES);
      const joined = dayOffset(day);
      joined.setHours(between(0, 23), between(0, 59), 0, 0);

      list.push({
        email: `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, "")}${between(1, 99)}@example.com`,
        joinedAt: joined.toISOString(),
        source: pick(["FOOTER", "NEWSLETTER", "NEWSLETTER", "POPUP", "CHECKOUT"] as const),
        city: place.city,
        converted: random() > 0.71,
      });
    }
  }

  return list.reverse();
}

export function seedDrops(): Drop[] {
  return [
    {
      id: "drop-01",
      name: "Collection '26 — The Drop",
      date: dayOffset(12).toISOString(),
      status: "LIVE",
      pieces: ["own-the-streets-heavyweight", "night-shift-longsleeve"],
      runSize: 340,
      note: "Anchor drop. Early-access list went out 24h ahead — 38% of first-day orders came from it.",
    },
    {
      id: "drop-02",
      name: "Movement — Restock",
      date: dayOffset(-9).toISOString(),
      status: "SCHEDULED",
      pieces: ["movement-waffle-tee", "static-graphic-tee"],
      runSize: 180,
      note: "Restock only, no new colourways. Hold the announcement until M is back in stock.",
    },
    {
      id: "drop-03",
      name: "Cities — Tour Capsule",
      date: dayOffset(-31).toISOString(),
      status: "SCHEDULED",
      pieces: ["cities-tour-tee"],
      runSize: 220,
      note: "Six-city back print. Photography shot but not colour-graded.",
    },
    {
      id: "drop-00",
      name: "Archive — Concrete",
      date: dayOffset(74).toISOString(),
      status: "ARCHIVED",
      pieces: ["concrete-pocket-tee"],
      runSize: 260,
      note: "Sold through in 19 days. Mineral wash ran long — factory needs 6 weeks' notice to repeat.",
    },
  ];
}
