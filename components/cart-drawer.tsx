"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/products";
import { Button, ButtonLink } from "./button";

const FREE_SHIPPING_AT = 150;

export function CartDrawer() {
  const { lines, subtotal, count, open, setOpen, remove, setQty } = useCart();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const toFree = Math.max(0, FREE_SHIPPING_AT - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100);

  return (
    <div
      className={`fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        aria-label="Close cart"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-ink/45 backdrop-blur-[2px] transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={`absolute top-0 right-0 flex h-full w-full max-w-[27rem] flex-col bg-paper transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="label">
            Your Bag <span className="text-red">[{count}]</span>
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="label text-ash transition-colors hover:text-red"
            tabIndex={open ? 0 : -1}
          >
            Close ✕
          </button>
        </header>

        {lines.length > 0 && (
          <div className="border-b border-line px-6 py-4">
            <p className="label mb-2.5 text-ash">
              {toFree > 0 ? (
                <>
                  <span className="text-ink">{money(toFree)}</span> to free
                  shipping
                </>
              ) : (
                <span className="text-red">Free shipping unlocked</span>
              )}
            </p>
            <div className="h-[3px] w-full bg-bone-2">
              <div
                className="h-full bg-red transition-[width] duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
            <div className="halftone h-20 w-20 text-ink/25" />
            <p className="display text-3xl">Bag&apos;s empty</p>
            <p className="max-w-[22ch] text-sm leading-relaxed text-ash">
              Nothing in here yet. The drop moves fast — sizes go first.
            </p>
            <ButtonLink href="/shop" onClick={() => setOpen(false)} arrow>
              Shop the drop
            </ButtonLink>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4 py-5">
                  <Link
                    href={`/shop/${line.slug}`}
                    onClick={() => setOpen(false)}
                    className="relative h-28 w-22 shrink-0 overflow-hidden bg-bone-2"
                  >
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      sizes="88px"
                      className="object-cover grayscale"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/shop/${line.slug}`}
                          onClick={() => setOpen(false)}
                          className="label block truncate transition-colors hover:text-red"
                        >
                          {line.name}
                        </Link>
                        <p className="mt-1.5 text-xs text-ash">
                          {line.subtitle} · Size {line.size}
                        </p>
                      </div>
                      <p className="label shrink-0">
                        {money(line.price * line.qty)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-line">
                        <button
                          onClick={() => setQty(line.id, line.qty - 1)}
                          aria-label={`Decrease quantity of ${line.name}`}
                          className="px-2.5 py-1 text-sm text-ash transition-colors hover:bg-ink hover:text-bone"
                        >
                          −
                        </button>
                        <span className="label w-8 text-center">{line.qty}</span>
                        <button
                          onClick={() => setQty(line.id, line.qty + 1)}
                          aria-label={`Increase quantity of ${line.name}`}
                          className="px-2.5 py-1 text-sm text-ash transition-colors hover:bg-ink hover:text-bone"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(line.id)}
                        className="label text-[0.625rem] text-ash underline-offset-4 transition-colors hover:text-red hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line px-6 py-5">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="label text-ash">Subtotal</span>
                <span className="display text-2xl">{money(subtotal)}</span>
              </div>
              <p className="mb-4 text-xs text-ash">
                Taxes and shipping calculated at checkout.
              </p>
              <Button
                className="w-full"
                arrow
                onClick={() => setOpen(false)}
                variant="solid"
              >
                Checkout
              </Button>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="label mt-3 block text-center text-ash underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                View full bag
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
