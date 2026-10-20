/**
 * The copy and measurements on the Fabric page and the home page's fabric band.
 *
 * Kept free of the Admin SDK so the editor — which runs in the browser — can
 * share the shape, the defaults and the validator with the Server Action.
 * `lib/fabric.ts` is the server-only reader.
 */

export type FabricPoint = { title: string; body: string };

/** Garment measurements in inches, taken flat. */
export type SizingRow = {
  size: string;
  chest: number;
  length: number;
  sleeve: number;
};

export type FabricContent = {
  /** The big number on the fabric band's tag. */
  gsm: number;
  points: FabricPoint[];
  sizing: SizingRow[];
};

/** What the site showed before this was editable; also the fallback when nothing is saved. */
export const DEFAULT_FABRIC: FabricContent = {
  gsm: 260,
  points: [
    {
      title: "Waffle structure",
      body: "An open weave that traps air instead of heat. The shirt moves air across the body so it keeps working past the first mile.",
    },
    {
      title: "260 GSM, garment dyed",
      body: "Heavy enough to hold a boxed shoulder without a single stiffener. Dyed after cutting so the colour sits deep and fades honestly.",
    },
    {
      title: "Three-pass hand print",
      body: "Pulled by hand, three passes, cured between each. The ink sits on the fabric rather than soaking into it — so it cracks the way it should.",
    },
  ],
  sizing: [
    { size: "XS", chest: 19.7, length: 26.8, sleeve: 7.9 },
    { size: "S", chest: 20.9, length: 27.6, sleeve: 8.3 },
    { size: "M", chest: 22, length: 28.3, sleeve: 8.7 },
    { size: "L", chest: 23.2, length: 29.1, sleeve: 9.1 },
    { size: "XL", chest: 24.4, length: 29.9, sleeve: 9.4 },
    { size: "XXL", chest: 25.6, length: 30.7, sleeve: 9.8 },
  ],
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const positive = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Checks untrusted input and returns clean content, or per-field errors keyed
 * like `point:1:title` / `sizing:0:chest` so the editor can show them inline.
 */
export function parseFabricContent(
  raw: unknown,
): { content: FabricContent; errors?: undefined } | { content?: undefined; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const input = isObject(raw) ? raw : {};

  const gsm = positive(input.gsm);
  if (gsm === null) errors.gsm = "Weight must be a positive number.";

  const points: FabricPoint[] = [];
  const rawPoints = Array.isArray(input.points) ? input.points : [];
  if (rawPoints.length === 0) errors.points = "Keep at least one point.";
  rawPoints.forEach((p, i) => {
    const title = isObject(p) ? String(p.title ?? "").trim() : "";
    const body = isObject(p) ? String(p.body ?? "").trim() : "";
    if (!title) errors[`point:${i}:title`] = "Give the point a title.";
    if (!body) errors[`point:${i}:body`] = "Write a line or two.";
    points.push({ title, body });
  });

  const sizing: SizingRow[] = [];
  const seen = new Set<string>();
  const rawSizing = Array.isArray(input.sizing) ? input.sizing : [];
  if (rawSizing.length === 0) errors.sizing = "Keep at least one size.";
  rawSizing.forEach((r, i) => {
    const row = isObject(r) ? r : {};
    const size = String(row.size ?? "").trim().toUpperCase();
    if (!size) errors[`sizing:${i}:size`] = "Name the size.";
    else if (seen.has(size)) errors[`sizing:${i}:size`] = "Already listed.";
    seen.add(size);

    const chest = positive(row.chest);
    const length = positive(row.length);
    const sleeve = positive(row.sleeve);
    if (chest === null) errors[`sizing:${i}:chest`] = "Inches, above zero.";
    if (length === null) errors[`sizing:${i}:length`] = "Inches, above zero.";
    if (sleeve === null) errors[`sizing:${i}:sleeve`] = "Inches, above zero.";

    sizing.push({ size, chest: chest ?? 0, length: length ?? 0, sleeve: sleeve ?? 0 });
  });

  if (Object.keys(errors).length > 0) return { errors };
  return { content: { gsm: gsm as number, points, sizing } };
}
