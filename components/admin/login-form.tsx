"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { AdminButton, Field, inputClass } from "./ui";

/**
 * Sign-in is a two-step handshake: Firebase in the browser proves who you are,
 * then the ID token is traded for an httpOnly session cookie the server can
 * read. The browser session itself is deliberately short-lived — the cookie is
 * the credential that matters, so there's no reason to persist a second one in
 * localStorage.
 */
export function LoginForm({ next = "/admin" }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      await setPersistence(auth, browserSessionPersistence);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();

      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        // The Firebase session is useless without the server cookie, so don't
        // leave the browser thinking it is signed in.
        await signOut(auth);
        setError(body.error ?? "Could not start a session.");
        setPending(false);
        return;
      }

      router.replace(next);
      router.refresh();
    } catch (caught) {
      setError(messageFor(caught));
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={inputClass}
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>

      {error && (
        <p className="label border border-red px-4 py-3.5 text-red" role="alert">
          {error}
        </p>
      )}

      <AdminButton type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </AdminButton>
    </form>
  );
}

/** Firebase error codes are not sentences. Translate the ones staff will hit. */
function messageFor(caught: unknown): string {
  const code =
    typeof caught === "object" && caught !== null && "code" in caught
      ? String((caught as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email and password don't match.";
    case "auth/invalid-email":
      return "That isn't a valid email address.";
    case "auth/user-disabled":
      return "That account has been disabled.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network problem — check your connection.";
    default:
      return "Sign-in failed. Try again.";
  }
}
