/**
 * What counts as a usable product photo.
 *
 * Deliberately free of any Firebase import: the file input in the browser needs
 * the same accept list and the same ceiling that the Server Action enforces, and
 * `lib/firebase/storage.ts` is server-only.
 */

/** Formats the storefront can serve and the browser can preview. */
export const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const ACCEPTED_IMAGE_TYPES = Object.keys(IMAGE_EXTENSIONS);

/**
 * Per-file ceiling. Two photos plus the rest of the form has to clear the
 * Server Action body limit in `next.config.ts`, which is what actually rejects
 * an oversized post — keep the two in step.
 */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/** The problem with this upload, or null if there isn't one. */
export function imageProblem(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Use a JPEG, PNG, WebP or AVIF.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `Keep it under ${MAX_IMAGE_BYTES / 1024 / 1024}MB — that one is ${mb}MB.`;
  }
  return null;
}
