/**
 * Formatting for the admin. Locales are pinned so a value renders identically
 * on the server and in the browser.
 */

const DATE = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });
const DATE_LONG = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const TIME = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const WEEKDAY = new Intl.DateTimeFormat("en-GB", { weekday: "short" });

const toDate = (value: string | Date) =>
  typeof value === "string" ? new Date(value) : value;

export const fmtDate = (value: string | Date) => DATE.format(toDate(value));
export const fmtDateLong = (value: string | Date) => DATE_LONG.format(toDate(value));
export const fmtTime = (value: string | Date) => TIME.format(toDate(value));
export const fmtWeekday = (value: string | Date) => WEEKDAY.format(toDate(value));

/** "2h ago", "3d ago" — the studio thinks in elapsed time, not timestamps. */
export function fmtAgo(value: string | Date) {
  const diff = Date.now() - toDate(value).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.round(days / 30)}mo ago`;
}

/** Whole cedis for tables and tiles — decimals are noise at this density. */
export const fmtMoney = (n: number) =>
  `₵${Math.round(n).toLocaleString("en-GB")}`;

/** Compact for hero figures: 12.9K, 4.2M. */
export function fmtCompactMoney(n: number) {
  if (Math.abs(n) >= 1_000_000) return `₵${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 10_000) return `₵${(n / 1000).toFixed(1)}K`;
  return fmtMoney(n);
}

export const fmtNumber = (n: number) => Math.round(n).toLocaleString("en-GB");

export const fmtPercent = (n: number, digits = 0) => `${n.toFixed(digits)}%`;

/** Signed, for deltas: +12%, −4%. Null when there is nothing to compare against. */
export function fmtDelta(delta: number | null, digits = 0) {
  if (delta === null) return "—";
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return `${sign}${Math.abs(delta).toFixed(digits)}%`;
}
