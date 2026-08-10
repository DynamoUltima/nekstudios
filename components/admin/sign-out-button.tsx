"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

/** Clears both halves of the session: the server cookie and the browser SDK. */
export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch("/api/admin/session", { method: "DELETE" });
        await signOut(auth).catch(() => {});
        router.replace("/admin/login");
        router.refresh();
      }}
      className={`label transition-colors disabled:opacity-40 ${className ?? ""}`}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
