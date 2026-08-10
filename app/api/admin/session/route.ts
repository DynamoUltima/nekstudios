/**
 * Session exchange for /admin.
 *
 * POST — takes the Firebase ID token minted in the browser, verifies it, checks
 * the admin claim, and mints an httpOnly session cookie. The ID token itself is
 * never stored: it lives for an hour and is readable by any script on the page.
 *
 * DELETE — signs out, and revokes the user's refresh tokens so a stolen cookie
 * cannot be re-minted elsewhere.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/server";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/admin/auth";

export async function POST(request: Request) {
  let idToken: string;

  try {
    ({ idToken } = await request.json());
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (!idToken) {
    return NextResponse.json({ error: "No token supplied." }, { status: 400 });
  }

  try {
    const claims = await adminAuth.verifyIdToken(idToken, true);

    if (claims.admin !== true) {
      // A valid Firebase user who is not staff. Say so plainly — hiding it
      // would leave someone staring at a form that silently never works.
      return NextResponse.json(
        { error: "That account doesn't have admin access." },
        { status: 403 },
      );
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const store = await cookies();
    store.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Sign-in expired. Try again." },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;

  if (cookie) {
    try {
      const claims = await adminAuth.verifySessionCookie(cookie);
      await adminAuth.revokeRefreshTokens(claims.sub);
    } catch {
      // Already invalid — clearing the cookie is still the right move.
    }
  }

  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
