/**
 * Admin SDK for command-line scripts.
 *
 * Deliberately separate from `lib/firebase/server.ts`: that module imports
 * `server-only`, which throws outside a React server environment, so scripts
 * cannot reuse it. Credentials resolve the same way.
 */

import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!projectId) {
  throw new Error(
    "No project configured. Run scripts with --env-file=.env.local so the Firebase config is loaded.",
  );
}

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: raw ? cert(JSON.parse(raw)) : applicationDefault(),
      projectId,
    });

export const db = getFirestore(app);
export const auth = getAuth(app);
export const PROJECT_ID = projectId;
