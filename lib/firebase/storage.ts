import "server-only";

/**
 * Product photography, held in Cloud Storage for Firebase.
 *
 * Writes go through the Admin SDK, which bypasses Storage rules — the only
 * caller is a Server Action already behind `assertAdmin()`, so the bucket needs
 * no public write path and `storage.rules` can stay closed.
 *
 * Reads are public by *download token* rather than by making the object public.
 * A token keeps working under uniform bucket-level access, never expires, and
 * produces the same URL shape the Firebase client SDK hands out. The Admin
 * SDK's own `getDownloadURL` re-reads object metadata to find that token and
 * throws if one was never minted, so we mint it on write and build the URL from
 * what we already have — one round trip instead of two.
 */

import { randomUUID } from "node:crypto";
import { getStorage } from "firebase-admin/storage";
import { IMAGE_EXTENSIONS } from "@/lib/admin/image-limits";
import { adminApp } from "./server";

const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

const HOST = "https://firebasestorage.googleapis.com";

function bucket() {
  if (!BUCKET) {
    throw new Error(
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set, so there is nowhere to put product photography.",
    );
  }
  return getStorage(adminApp).bucket(BUCKET);
}

/**
 * An empty file input still arrives as a `File`, with zero bytes — this is what
 * separates "no photo chosen" from "photo chosen".
 */
export function isFilledFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

export type ImageKind = "front" | "back";

/** Uploads one photo and returns the URL to store on the product. */
export async function uploadProductImage(
  file: File,
  slug: string,
  kind: ImageKind,
): Promise<string> {
  const target = bucket();
  const extension = IMAGE_EXTENSIONS[file.type] ?? "jpg";

  // A fresh id on every upload means a replaced photo is a new object at a new
  // URL, so nothing serves the old shot from a CDN or a browser cache. It also
  // keeps the immutable cache header below honest.
  const path = `products/${slug}/${kind}-${randomUUID()}.${extension}`;
  const token = randomUUID();

  await target.file(path).save(Buffer.from(await file.arrayBuffer()), {
    // Product shots are small enough that a resumable session is pure overhead.
    resumable: false,
    metadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  return `${HOST}/v0/b/${target.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

/**
 * Removes a photo this app uploaded. Best effort: a replaced shot that outlives
 * its product is litter, not a fault, and must never fail the save that
 * replaced it. URLs pointing anywhere else — the seed catalogue is all Unsplash
 * — are left alone.
 */
export async function deleteProductImage(url: string | undefined): Promise<void> {
  if (!url || !BUCKET || !url.startsWith(`${HOST}/v0/b/${BUCKET}/o/`)) return;

  try {
    const path = decodeURIComponent(
      new URL(url).pathname.split("/o/")[1] ?? "",
    );
    if (!path) return;

    await bucket().file(path).delete({ ignoreNotFound: true });
  } catch {
    // Orphaned object. Not worth surfacing to whoever just saved a product.
  }
}
