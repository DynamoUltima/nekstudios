import "server-only";

/**
 * Firebase Admin SDK — server only.
 *
 * This module holds credentials that must never reach the browser. The
 * `server-only` import above turns an accidental client import into a build
 * error rather than a leak.
 *
 * Credentials resolve in two ways:
 *
 * 1. `FIREBASE_SERVICE_ACCOUNT` — the service account JSON on one line. Use
 *    this in production (Vercel), where there is no gcloud login to fall back
 *    on.
 * 2. Application Default Credentials — what `firebase login` already wrote to
 *    ~/.config/firebase. Enough for local development.
 */

import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

function credential() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return applicationDefault();

  try {
    return cert(JSON.parse(raw));
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is set but is not valid JSON. Paste the whole service account file on one line.",
    );
  }
}

export const adminApp: App = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: credential(), projectId });

export const adminDb: Firestore = getFirestore(adminApp);
export const adminAuth: Auth = getAuth(adminApp);

/** Firestore rejects `undefined`; every writer goes through this. */
export function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as T;
}
