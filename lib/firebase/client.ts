/**
 * Firebase, browser side.
 *
 * Two things the console's copy-paste snippet gets wrong in a Next.js app:
 *
 * 1. `initializeApp` runs again on every hot reload and every server render,
 *    and Firebase throws on a duplicate app. `getApps()` guards it.
 * 2. `getAnalytics()` touches `window` and `navigator`, so importing it at
 *    module scope crashes any Server Component that pulls this file in. It is
 *    behind `initAnalytics()`, which only runs in a supported browser.
 */

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.projectId) {
  throw new Error(
    "Firebase config is missing. Copy .env.example to .env.local and fill it in.",
  );
}

export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);

/**
 * Start Analytics. Call from a client component effect — never at module
 * scope, and never on the server. Resolves to null where Analytics can't run
 * (server, unsupported browser, no measurement ID).
 */
export async function initAnalytics() {
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.measurementId) return null;

  const { getAnalytics, isSupported } = await import("firebase/analytics");
  if (!(await isSupported())) return null;

  return getAnalytics(firebaseApp);
}
