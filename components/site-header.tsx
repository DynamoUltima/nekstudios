"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

const NAV = [
  { label: "Movement", href: "/shop?c=movement" },
  { label: "Fabric", href: "/fabric" },
  { label: "The Drop", href: "/shop" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "Cities", href: "/#cities" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const { count, setOpen, ready } = useCart();
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
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="label group relative text-ink/75 transition-colors duration-300 hover:text-ink"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-red transition-[width] duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={() => setOpen(true)}
              className="label text-ink/75 transition-colors hover:text-red"
              aria-label={`Open bag, ${count} items`}
            >
              Bag
              <span className="ml-1.5 text-red">
                [{ready ? count : 0}]
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
              className="display border-b border-line py-4 text-5xl transition-colors hover:text-red sm:text-6xl"
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
