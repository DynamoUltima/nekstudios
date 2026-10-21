import { collectionNames } from "@/lib/admin/types";
import { CartProvider } from "@/lib/cart";
import { getProducts } from "@/lib/catalogue";
import { Suspense } from "react";
import { Analytics } from "./analytics";
import { CartDrawer } from "./cart-drawer";
import { SiteFooter } from "./site-footer";
import { SiteHeader, SiteHeaderFallback } from "./site-header";

/**
 * Storefront chrome. Lives in a component rather than the root layout because
 * the root layout is now shared with /admin, which wears its own shell.
 */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const collections = collectionNames(await getProducts());

  return (
    <CartProvider>
      {/* The header reads the query string, which needs a Suspense boundary. */}
      <Suspense fallback={<SiteHeaderFallback collections={collections} />}>
        <SiteHeader collections={collections} />
      </Suspense>
      <main>{children}</main>
      <SiteFooter collections={collections} />
      <CartDrawer />
      {/* Storefront only — no analytics on /admin. */}
      <Analytics />
    </CartProvider>
  );
}
