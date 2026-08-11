import "server-only";

/**
 * Who is allowed at the studio desk.
 *
 * Firebase Auth runs in the browser, but Server Components can't see a browser
 * SDK session — so signing in trades the client's ID token for an httpOnly
 * session cookie (see `app/api/admin/session/route.ts`). Everything on the
 * server reads that cookie.
 *
 * Admin rights are a custom claim (`admin: true`) set by `npm run create-admin`.
 * A claim rather than a Firestore lookup, so the check is a signature
 * verification rather than a database read on every request.
 *
 * Two entry points, deliberately different:
 *
 * - `requireAdmin()` — for pages. Redirects to the sign-in screen.
 * - `assertAdmin()`  — for Server Actions. Throws, because an action reached
 *   by direct POST should fail loudly, not quietly bounce.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/server";

export const SESSION_COOKIE = "eikone_admin_session";

/** Two weeks — Firebase's ceiling for a session cookie. */
export const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export type AdminSession = {
  uid: string;
  email: string;
};

/** The signed-in admin, or null. Never throws — callers decide what to do. */
export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  try {
    // `true` checks the user hasn't been disabled or had their session revoked
    // since the cookie was minted. It costs a lookup; worth it for an admin.
    const claims = await adminAuth.verifySessionCookie(cookie, true);
    if (claims.admin !== true) return null;

    return { uid: claims.uid, email: claims.email ?? "" };
  } catch {
    // Expired, revoked, or forged — all the same answer.
    return null;
  }
}

/** Page guard. Sends the visitor to sign in, remembering where they wanted to go. */
export async function requireAdmin(returnTo?: string): Promise<AdminSession> {
  const session = await getSession();
  if (session) return session;

  const target = returnTo
    ? `/admin/login?next=${encodeURIComponent(returnTo)}`
    : "/admin/login";

  redirect(target);
}

/** Server Action guard. */
export async function assertAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
