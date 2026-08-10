import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Already signed in — no reason to show the form.
  if (await getSession()) redirect(next ?? "/admin");

  // Only ever bounce back inside the admin, so a crafted ?next= can't turn this
  // page into an open redirect.
  const target = next?.startsWith("/admin") ? next : "/admin";

  return (
    <div className="flex min-h-svh flex-col justify-center bg-ink px-5 py-16 text-bone">
      <div className="mx-auto w-full max-w-sm">
        <Link href="/" className="label text-sm tracking-[0.28em]">
          NEK <span className="text-red">Studios</span>
        </Link>

        <h1
          className="display mt-10"
          style={{ fontSize: "clamp(2.5rem, 8vw, 3.5rem)" }}
        >
          Studio
          <br />
          desk
        </h1>

        <p className="mt-6 text-sm leading-relaxed text-bone/50">
          Staff only. Orders, stock and pricing all write straight through to the
          live store.
        </p>

        <div className="mt-10 bg-bone p-6 text-ink">
          <LoginForm next={target} />
        </div>

        <p className="label mt-8 text-[0.5625rem] leading-[1.8] text-bone/30">
          No account? An existing admin creates one with
          <br />
          <code className="font-mono">npm run create-admin</code>
        </p>
      </div>
    </div>
  );
}
