import { collectionNames } from "@/lib/admin/types";
import { CartProvider } from "@/lib/cart";
import { getProducts } from "@/lib/catalogue";
import { Analytics } from "./analytics";
import { CartDrawer } from "./cart-drawer";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/**
 * Storefront chrome. Lives in a component rather than the root layout because
 * the root layout is now shared with /admin, which wears its own shell.
 */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const collections = collectionNames(await getProducts());

  return (
    <CartProvider>
      <SiteHeader collections={collections} />
      <main>{children}</main>
      <SiteFooter collections={collections} />
      <CartDrawer />
      {/* Storefront only — no analytics on /admin. */}
      <Analytics />
    </CartProvider>
  );
}
