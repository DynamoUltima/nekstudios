import { CartProvider } from "@/lib/cart";
import { Analytics } from "./analytics";
import { CartDrawer } from "./cart-drawer";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/**
 * Storefront chrome. Lives in a component rather than the root layout because
 * the root layout is now shared with /admin, which wears its own shell.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <CartDrawer />
      {/* Storefront only — no analytics on /admin. */}
      <Analytics />
    </CartProvider>
  );
}
