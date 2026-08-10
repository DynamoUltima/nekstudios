import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Studio desk",
    template: "%s · NEK Admin",
  },
  description: "Order, inventory and drop management for NEK Studios.",
  // Nothing under /admin belongs in an index.
  robots: { index: false, follow: false },
};

// An admin reads live state — never a page baked at build time.
export const dynamic = "force-dynamic";

/**
 * Metadata and render policy only. The chrome lives in the `(desk)` layout,
 * which has the session — `/admin/login` sits outside it and gets no shell.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
