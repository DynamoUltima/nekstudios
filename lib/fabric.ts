import "server-only";

import { cache } from "react";
import { adminDb } from "./firebase/server";
import { DEFAULT_FABRIC, parseFabricContent, type FabricContent } from "./fabric-types";

export const SITE_COLLECTION = "site";
export const FABRIC_DOC = "fabric";

/**
 * The Fabric page's content. Falls back to the original copy when nothing has
 * been saved yet, or when what's saved no longer validates — a broken document
 * should never blank the storefront.
 */
export const getFabricContent = cache(async (): Promise<FabricContent> => {
  const doc = await adminDb.collection(SITE_COLLECTION).doc(FABRIC_DOC).get();
  if (!doc.exists) return DEFAULT_FABRIC;

  const parsed = parseFabricContent(doc.data());
  return parsed.content ?? DEFAULT_FABRIC;
});
