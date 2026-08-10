import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";

/**
 * The gate. Everything inside this route group is staff-only; `/admin/login`
 * sits outside it, which is why the group exists.
 *
 * Server Actions are checked separately in `assertAdmin()` — a layout guard
 * only covers rendering, and actions answer direct POSTs.
 */
export default async function AdminDeskLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
