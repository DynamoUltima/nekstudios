"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { collectionLink } from "@/lib/collection-links";

const PAGES = [
  { label: "Shop", href: "/shop" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "Cities", href: "/#cities" },
];

/** Whether a nav link points at the page being viewed. Hash links never match. */
function isCurrent(href: string, pathname: string, collection: string | null) {
  const url = new URL(href, "http://x");
  if (url.hash) return false;

  const target = url.searchParams.get("c");
  if (target) return pathname === "/shop" && collection === target;

  // "Shop" covers the product pages too, but not a filtered collection view.
  if (url.pathname === "/shop") {
    return pathname.startsWith("/shop") && !collection;
  }
  return pathname.startsWith(url.pathname);
}

/**
 * Reading the query string needs a Suspense boundary, so the header is split:
 * this wrapper reads it, and the view below renders without it as the fallback.
 * That keeps the nav in the server-rendered HTML.
 */
export function SiteHeader({ collections }: { collections: string[] }) {
  return <HeaderView collections={collections} collection={useSearchParams().get("c")} />;
}

export function SiteHeaderFallback({ collections }: { collections: string[] }) {
  return <HeaderView collections={collections} collection={null} />;
}

function HeaderView({
  collections,
  collection,
}: {
  collections: string[];
  collection: string | null;
}) {
  // Collections are renamed from the admin, so the nav follows the catalogue.
  const [shop, ...rest] = PAGES;
  const NAV = [shop, ...collections.map(collectionLink), ...rest];

  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const { count: stored, setOpen, ready } = useCart();
  // The bag lives in localStorage, so the server can't know it. Show zero until
  // the client has read it, or the first render won't match the HTML.
  const count = ready ? stored : 0;
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenu(false), [pathname]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-line bg-bone/90 backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[110rem] items-center justify-between px-5 py-4 md:px-10 md:py-5">
          <Link
            href="/"
            className="label text-sm tracking-[0.28em] whitespace-nowrap"
            aria-label="Eikone home"
          >
            Eik<span className="text-red">one</span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
            {NAV.map((item) => {
              const current = isCurrent(item.href, pathname, collection);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`label group relative transition-colors duration-300 hover:text-ink ${
                    current ? "text-ink" : "text-ink/75"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-red transition-[width] duration-300 group-hover:w-full ${
                      current ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={() => setOpen(true)}
              className="label text-ink/75 transition-colors hover:text-red"
              aria-label={`Open bag, ${count} items`}
            >
              Bag
              <span className="ml-1.5 text-red">
                [{count}]
              </span>
            </button>

            <Link
              href="/shop"
              className="label hidden bg-ink px-6 py-3.5 text-bone transition-colors duration-300 hover:bg-red md:inline-flex"
            >
              Get Early Access
            </Link>

            <button
              onClick={() => setMenu((v) => !v)}
              className="flex h-6 w-7 flex-col items-end justify-center gap-1.5 lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={menu}
            >
              <span
                className={`h-px bg-ink transition-all duration-300 ${
                  menu ? "w-6 translate-y-[3.5px] rotate-45" : "w-7"
                }`}
              />
              <span
                className={`h-px bg-ink transition-all duration-300 ${
                  menu ? "w-6 -translate-y-[3.5px] -rotate-45" : "w-5"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        className={`fixed inset-0 z-40 bg-bone transition-all duration-500 lg:hidden ${
          menu
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex h-full flex-col justify-center gap-2 px-8">
          {NAV.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isCurrent(item.href, pathname, collection) ? "page" : undefined}
              className={`display border-b border-line py-4 text-5xl transition-colors hover:text-red sm:text-6xl ${
                isCurrent(item.href, pathname, collection) ? "text-red" : ""
              }`}
              style={{
                transitionDelay: menu ? `${i * 55 + 120}ms` : "0ms",
                opacity: menu ? 1 : 0,
                transform: menu ? "none" : "translateY(18px)",
                transitionProperty: "opacity, transform, color",
                transitionDuration: "600ms",
              }}
            >
              {item.label}
            </Link>
          ))}
          <p className="label mt-10 text-ash">Move different. Live your vibes.</p>
        </nav>
      </div>
    </>
  );
}
