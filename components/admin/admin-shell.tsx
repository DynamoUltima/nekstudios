import Link from "next/link";
import { AdminNav, AdminNavStrip, type NavGroup } from "./admin-nav";
import { SignOutButton } from "./sign-out-button";
import { fulfilmentQueue } from "@/lib/admin/metrics";

export async function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  const waiting = (await fulfilmentQueue()).length;

  const groups: NavGroup[] = [
    {
      title: "Trade",
      items: [
        { label: "Overview", href: "/admin" },
        { label: "Orders", href: "/admin/orders", badge: waiting },
      ],
    },
    {
      title: "Catalogue",
      items: [
        { label: "Products", href: "/admin/products" },
        { label: "Inventory", href: "/admin/inventory" },
        { label: "Drops", href: "/admin/drops" },
      ],
    },
    {
      title: "Audience",
      items: [{ label: "The list", href: "/admin/subscribers" }],
    },
  ];

  return (
    <div data-admin className="min-h-svh bg-bone lg:grid lg:grid-cols-[15rem_1fr]">
      {/* Rail — desktop */}
      <aside className="sticky top-0 hidden h-svh flex-col justify-between border-r border-ink bg-ink py-7 text-bone lg:flex">
        <div>
          <Link
            href="/admin"
            className="label block px-5 text-sm tracking-[0.28em]"
            aria-label="Eikone admin home"
          >
            Eik<span className="text-red">one</span>
          </Link>
          <p className="label mt-2 px-5 text-[0.5625rem] text-bone/35">
            Studio desk
          </p>

          <div className="mt-10">
            <AdminNav groups={groups} />
          </div>
        </div>

        <div className="px-5">
          <Link
            href="/"
            className="label group flex items-center gap-2 text-bone/45 transition-colors hover:text-bone"
          >
            View store
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              ↗
            </span>
          </Link>

          <div className="mt-6 border-t border-white/10 pt-5">
            {email && (
              <p className="label truncate text-[0.5625rem] text-bone/35">
                {email}
              </p>
            )}
            <SignOutButton className="mt-3 text-bone/45 hover:text-red" />
          </div>
        </div>
      </aside>

      {/* Rail — mobile */}
      <div className="sticky top-0 z-40 bg-ink text-bone lg:hidden">
        <div className="flex items-center justify-between px-5 pt-5">
          <Link href="/admin" className="label text-sm tracking-[0.28em]">
            Eik<span className="text-red">one</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="label text-bone/45">
              View store ↗
            </Link>
            <SignOutButton className="text-bone/45" />
          </div>
        </div>
        <div className="mt-3">
          <AdminNavStrip groups={groups} />
        </div>
      </div>

      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Page masthead. Every admin route opens with one. */
export function AdminPageHead({
  eyebrow,
  title,
  lede,
  actions,
}: {
  eyebrow: React.ReactNode;
  title: string;
  lede?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="border-b border-line px-5 pt-9 pb-8 md:px-9 md:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label flex items-center gap-3 text-red">
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 bg-red" />
            {eyebrow}
          </p>
          <h1
            className="display mt-5"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
          >
            {title}
          </h1>
          {lede && (
            <p className="mt-5 max-w-[58ch] text-sm leading-relaxed text-ash">
              {lede}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
      </div>
    </header>
  );
}
