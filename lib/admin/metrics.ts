import "server-only";

/**
 * Everything the admin counts. Pure derivations over the store — no state of
 * their own. Each one awaits the cached readers, so a page calling four of
 * them still makes one round trip per collection.
 *
 * Refunded orders are excluded from revenue everywhere. They are still orders,
 * so they stay in the counts.
 */

import { getCatalogue } from "@/lib/catalogue";
import { getOrders, getSubscribers } from "./store";
import type { Order } from "./types";

const DAY = 86_400_000;

const startOfDay = (d: Date) => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
};

const earned = (o: Order) => (o.status === "REFUNDED" ? 0 : o.total);
const unitsIn = (o: Order) => o.lines.reduce((n, l) => n + l.qty, 0);

/* --------------------------------- series --------------------------------- */

export type DayPoint = {
  /** Midnight, local. */
  date: Date;
  revenue: number;
  orders: number;
};

/** Revenue and order count per day, oldest first, gaps filled with zeroes. */
export async function dailyRevenue(days: number): Promise<DayPoint[]> {
  const today = startOfDay(new Date()).getTime();
  const buckets = new Map<number, DayPoint>();

  for (let i = days - 1; i >= 0; i--) {
    const time = today - i * DAY;
    buckets.set(time, { date: new Date(time), revenue: 0, orders: 0 });
  }

  for (const order of await getOrders()) {
    const key = startOfDay(new Date(order.placedAt)).getTime();
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.revenue += earned(order);
    bucket.orders += 1;
  }

  return [...buckets.values()];
}

/* -------------------------------- headline -------------------------------- */

export type Trend = {
  value: number;
  previous: number;
  /** Signed percentage change, or null when the previous window was empty. */
  delta: number | null;
};

const trend = (value: number, previous: number): Trend => ({
  value,
  previous,
  delta: previous === 0 ? null : ((value - previous) / previous) * 100,
});

export type Summary = {
  window: number;
  revenue: Trend;
  orders: Trend;
  units: Trend;
  aov: Trend;
  returningRate: number;
};

/** Last `window` days against the `window` days before them. */
export async function summary(window = 14): Promise<Summary> {
  const now = Date.now();
  const currentFrom = startOfDay(new Date(now - (window - 1) * DAY)).getTime();
  const previousFrom = currentFrom - window * DAY;

  const current: Order[] = [];
  const previous: Order[] = [];

  for (const order of await getOrders()) {
    const time = new Date(order.placedAt).getTime();
    if (time >= currentFrom) current.push(order);
    else if (time >= previousFrom) previous.push(order);
  }

  const sum = (list: Order[], fn: (o: Order) => number) =>
    list.reduce((n, o) => n + fn(o), 0);

  const revenueNow = sum(current, earned);
  const revenuePrev = sum(previous, earned);

  return {
    window,
    revenue: trend(revenueNow, revenuePrev),
    orders: trend(current.length, previous.length),
    units: trend(sum(current, unitsIn), sum(previous, unitsIn)),
    aov: trend(
      current.length ? revenueNow / current.length : 0,
      previous.length ? revenuePrev / previous.length : 0,
    ),
    returningRate: current.length
      ? (current.filter((o) => o.customer.priorOrders > 0).length /
          current.length) *
        100
      : 0,
  };
}

/* -------------------------------- products -------------------------------- */

export type ProductPerformance = {
  slug: string;
  name: string;
  subtitle: string;
  collection: string;
  price: number;
  unitsSold: number;
  revenue: number;
  stock: number;
  run: number;
  /** Percentage of the cut run that has left the shelf. */
  sellThrough: number;
  /** Sizes with nothing left. */
  outOfSize: string[];
};

export async function productPerformance(): Promise<ProductPerformance[]> {
  const [orders, catalogue] = await Promise.all([getOrders(), getCatalogue()]);
  const sold = new Map<string, { units: number; revenue: number }>();

  for (const order of orders) {
    if (order.status === "REFUNDED") continue;
    for (const line of order.lines) {
      const row = sold.get(line.slug) ?? { units: 0, revenue: 0 };
      row.units += line.qty;
      row.revenue += line.qty * line.price;
      sold.set(line.slug, row);
    }
  }

  return catalogue
    .map(({ product, stock: cells }) => {
      const stock = cells.reduce((n, c) => n + c.stock, 0);
      const run = cells.reduce((n, c) => n + c.run, 0);
      const row = sold.get(product.slug) ?? { units: 0, revenue: 0 };

      return {
        slug: product.slug,
        name: product.name,
        subtitle: product.subtitle,
        collection: product.collection,
        price: product.price,
        unitsSold: row.units,
        revenue: row.revenue,
        stock,
        run,
        sellThrough: run ? ((run - stock) / run) * 100 : 0,
        outOfSize: cells.filter((c) => c.stock === 0).map((c) => c.size),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

/* -------------------------------- inventory ------------------------------- */

export type StockAlert = {
  slug: string;
  name: string;
  size: string;
  stock: number;
  run: number;
};

/** Sizes at or below `threshold`, worst first. Zero-stock sizes lead. */
export async function stockAlerts(threshold = 8): Promise<StockAlert[]> {
  const catalogue = await getCatalogue();
  const alerts: StockAlert[] = [];

  for (const { product, stock } of catalogue) {
    for (const cell of stock) {
      if (cell.stock <= threshold) {
        alerts.push({
          slug: product.slug,
          name: product.name,
          size: cell.size,
          stock: cell.stock,
          run: cell.run,
        });
      }
    }
  }

  return alerts.sort((a, b) => a.stock - b.stock);
}

/** Units sold per size across the catalogue — the next run's size curve. */
export async function sizeDemand(slug?: string): Promise<Map<string, number>> {
  const demand = new Map<string, number>();

  for (const order of await getOrders()) {
    if (order.status === "REFUNDED") continue;
    for (const line of order.lines) {
      if (slug && line.slug !== slug) continue;
      demand.set(line.size, (demand.get(line.size) ?? 0) + line.qty);
    }
  }

  return demand;
}

/* ------------------------------- subscribers ------------------------------ */

export type ListStats = {
  total: number;
  last30: number;
  previous30: number;
  convertedRate: number;
  bySource: { source: string; count: number }[];
};

export async function listStats(): Promise<ListStats> {
  const subscribers = await getSubscribers();
  const now = Date.now();
  const cut30 = now - 30 * DAY;
  const cut60 = now - 60 * DAY;

  const bySource = new Map<string, number>();
  let last30 = 0;
  let previous30 = 0;
  let converted = 0;

  for (const sub of subscribers) {
    const time = new Date(sub.joinedAt).getTime();
    if (time >= cut30) last30++;
    else if (time >= cut60) previous30++;
    if (sub.converted) converted++;
    bySource.set(sub.source, (bySource.get(sub.source) ?? 0) + 1);
  }

  return {
    total: subscribers.length,
    last30,
    previous30,
    convertedRate: subscribers.length ? (converted / subscribers.length) * 100 : 0,
    bySource: [...bySource.entries()]
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count),
  };
}

/* --------------------------------- queue ---------------------------------- */

/** Orders waiting on the studio: oldest first, because they have waited longest. */
export async function fulfilmentQueue(): Promise<Order[]> {
  const orders = await getOrders();

  return orders
    .filter((o) => o.status === "NEW" || o.status === "PACKING")
    .sort(
      (a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime(),
    );
}
