"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "./auth";
import type { ProductFormState } from "./form-state";
import {
  BADGES,
  COLLECTIONS,
  ORDER_STATUSES,
  RESERVED_SLUGS,
  SIZE_LADDER,
  SLUG_PATTERN,
  createProduct as writeProduct,
  patchProduct,
  setOrderStatus,
  slugify,
  type OrderStatus,
  type ProductPatch,
  type StockCell,
} from "./store";
import {
  deleteProductImage,
  isFilledFile,
  uploadProductImage,
} from "@/lib/firebase/storage";
import { imageProblem } from "./image-limits";
import { getEntry } from "@/lib/catalogue";
import type { Product } from "@/lib/products";

/* -------------------------------- orders ---------------------------------- */

export async function updateOrderStatus(formData: FormData) {
  await assertAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;

  if (!id || !ORDER_STATUSES.includes(status)) return;

  await setOrderStatus(id, status);

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

/* ------------------------------ shared bits ------------------------------- */

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

/** The fields both forms edit. Errors accumulate into the caller's bag. */
type Listing = {
  price: number;
  collection: Product["collection"];
  status: Product["status"] | null;
  colorway: string;
  description: string;
};

function readListing(
  formData: FormData,
  errors: Record<string, string>,
): Listing {
  const price = Number(formData.get("price"));
  if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Price must be a number above zero.";
  }

  const collection = text(formData, "collection") as Product["collection"];
  if (!COLLECTIONS.includes(collection)) {
    errors.collection = "Pick a collection.";
  }

  const badge = text(formData, "status");
  if (badge && !BADGES.includes(badge as NonNullable<Product["status"]>)) {
    errors.status = "Unknown badge.";
  }

  const colorway = text(formData, "colorway");
  if (!colorway) errors.colorway = "Colourway can't be empty.";

  const description = text(formData, "description");
  if (description.length < 20) {
    errors.description = "Give the piece at least a sentence.";
  }

  return {
    price,
    collection,
    status: badge ? (badge as NonNullable<Product["status"]>) : null,
    colorway,
    description,
  };
}

/**
 * Validates a chosen photo without uploading it. Nothing reaches the bucket
 * until every field on the form has passed, so a rejected submit leaves no
 * orphaned objects behind.
 */
function readImage(
  formData: FormData,
  field: string,
  errors: Record<string, string>,
): File | null {
  const value = formData.get(field);
  if (!isFilledFile(value)) return null;

  const problem = imageProblem(value);
  if (problem) {
    errors[field] = problem;
    return null;
  }

  return value;
}

/* -------------------------------- products -------------------------------- */

export async function updateProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await assertAdmin();

  const slug = text(formData, "slug");
  const errors: Record<string, string> = {};

  const listing = readListing(formData, errors);

  const front = readImage(formData, "image", errors);
  const back = readImage(formData, "imageAlt", errors);

  // Alt text is editable on its own — a description can be wrong without the
  // photo being wrong. It only becomes mandatory when the shot it describes is
  // being replaced.
  const alt = text(formData, "alt");
  if (front && !alt) {
    errors.alt = "Describe the new shot for anyone who can't see it.";
  }

  // Stock arrives as stock:<SIZE> so a variable number of sizes needs no schema.
  const stock: Record<string, number> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("stock:")) continue;
    const size = key.slice(6);
    const units = Number(value);
    if (!Number.isFinite(units) || units < 0) {
      errors[key] = "Units must be zero or more.";
      continue;
    }
    stock[size] = Math.round(units);
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Nothing saved — check the fields below.", errors };
  }

  // Read the current photos before the patch, so replaced ones can be swept up.
  const existing = front || back ? await getEntry(slug) : null;

  const [frontUrl, backUrl] = await Promise.all([
    front ? uploadProductImage(front, slug, "front") : undefined,
    back ? uploadProductImage(back, slug, "back") : undefined,
  ]);

  const patch: ProductPatch = {
    ...listing,
    stock,
    image: frontUrl,
    alt: alt || undefined,
    imageAlt: backUrl,
  };

  const product = await patchProduct(slug, patch);

  if (!product) {
    // The piece vanished between the form loading and this save. Don't leave
    // its photography behind in the bucket.
    await Promise.all([deleteProductImage(frontUrl), deleteProductImage(backUrl)]);
    return { ok: false, message: "That piece is no longer in the catalogue.", errors: {} };
  }

  if (frontUrl) await deleteProductImage(existing?.product.image);
  if (backUrl) await deleteProductImage(existing?.product.imageAlt);

  revalidateProduct(slug);

  return { ok: true, message: `${product.name} saved.`, errors: {} };
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await assertAdmin();

  const errors: Record<string, string> = {};
  const listing = readListing(formData, errors);

  const name = text(formData, "name");
  if (!name) errors.name = "Every piece needs a name.";

  const subtitle = text(formData, "subtitle");
  if (!subtitle) errors.subtitle = "The subtitle is the cut — 'Heavyweight Box Tee'.";

  const slug = slugify(text(formData, "slug") || name);
  if (!SLUG_PATTERN.test(slug) || slug.length < 3) {
    errors.slug = "Use lowercase letters, numbers and hyphens — at least three characters.";
  } else if (RESERVED_SLUGS.has(slug)) {
    errors.slug = `"${slug}" is reserved by the admin. Pick another permalink.`;
  }

  const fabric = text(formData, "fabric");
  if (!fabric) errors.fabric = "Name the cloth.";

  const weightGsm = Number(formData.get("weightGsm"));
  if (!Number.isFinite(weightGsm) || weightGsm <= 0) {
    errors.weightGsm = "Weight must be a number above zero.";
  }

  // Blank means "not on sale", which is different from a strikethrough at zero.
  const compareAtRaw = text(formData, "compareAt");
  let compareAt: number | undefined;
  if (compareAtRaw) {
    const parsed = Number(compareAtRaw);
    if (!Number.isFinite(parsed) || parsed <= listing.price) {
      errors.compareAt = "A compare-at price only reads as a discount above the price.";
    } else {
      compareAt = parsed;
    }
  }

  const details = text(formData, "details")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  /* the run */

  const stock: StockCell[] = [];
  for (const size of SIZE_LADDER) {
    const run = Number(formData.get(`run:${size}`) ?? 0);
    if (!Number.isFinite(run) || run < 0) {
      errors[`run:${size}`] = "Run must be zero or more.";
      continue;
    }
    // A size cut at zero simply isn't part of this piece.
    if (run === 0) continue;

    const units = Number(formData.get(`stock:${size}`) ?? 0);
    if (!Number.isFinite(units) || units < 0) {
      errors[`stock:${size}`] = "Units must be zero or more.";
      continue;
    }
    if (units > run) {
      errors[`stock:${size}`] = `Can't have more on the shelf than the ${run} cut.`;
      continue;
    }

    stock.push({ size, stock: Math.round(units), run: Math.round(run) });
  }

  if (stock.length === 0 && !Object.keys(errors).some((k) => k.startsWith("run:"))) {
    errors["run:XS"] = "Cut at least one size.";
  }

  /* photography */

  const front = readImage(formData, "image", errors);
  if (!front && !errors.image) errors.image = "A new piece needs its primary shot.";

  const back = readImage(formData, "imageAlt", errors);
  if (!back && !errors.imageAlt) errors.imageAlt = "The hover shot is the second photo on the card.";

  const alt = text(formData, "alt");
  if (!alt) errors.alt = "Describe the primary shot for anyone who can't see it.";

  // The `!front || !back` arm is already covered by the errors above; it is
  // here so the upload below sees two files rather than two maybe-files.
  if (Object.keys(errors).length > 0 || !front || !back) {
    return { ok: false, message: "Nothing created — check the fields below.", errors };
  }

  // Cheap, friendly check before spending an upload. The transaction inside
  // `writeProduct` is what actually makes the slug safe against a race.
  if (await getEntry(slug)) {
    return {
      ok: false,
      message: "",
      errors: { slug: "That permalink is already in the catalogue." },
    };
  }

  const [image, imageAlt] = await Promise.all([
    uploadProductImage(front, slug, "front"),
    uploadProductImage(back, slug, "back"),
  ]);

  const product = await writeProduct({
    slug,
    name,
    subtitle,
    price: listing.price,
    compareAt,
    collection: listing.collection,
    colorway: listing.colorway,
    image,
    alt,
    imageAlt,
    fabric,
    weightGsm,
    sizes: stock.map((cell) => cell.size),
    status: listing.status,
    description: listing.description,
    details,
    stock,
  });

  if (!product) {
    await Promise.all([deleteProductImage(image), deleteProductImage(imageAlt)]);
    return {
      ok: false,
      message: "",
      errors: { slug: "Someone just took that permalink. Pick another." },
    };
  }

  revalidateProduct(slug);

  // Straight to the editor: the piece is live, and stock is the next thing
  // anyone wants to look at.
  redirect(`/admin/products/${slug}`);
}

/** Everywhere a piece is read. The home page carries the featured grid. */
function revalidateProduct(slug: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${slug}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);
}
