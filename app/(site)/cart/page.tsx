"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/button";
import { PageHead } from "@/components/page-head";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/products";

const FREE_SHIPPING_AT = 150;

export default function CartPage() {
  const { lines, subtotal, count, ready, remove, setQty, clear } = useCart();
  const shipping = subtotal >= FREE_SHIPPING_AT || subtotal === 0 ? 0 : 12;

  return (
    <>
      <PageHead
        eyebrow={ready ? `${count} ${count === 1 ? "piece" : "pieces"}` : "Bag"}
        title="Your Bag"
        accent
      />

      <section className="pb-24 md:pb-32">
        <div className="mx-auto max-w-[110rem] px-5 md:px-10">
          {!ready ? (
            <div className="h-64" />
          ) : lines.length === 0 ? (
            <div className="border-t border-line py-24 text-center">
              <div className="halftone mx-auto h-24 w-24 text-ink/25" />
              <p className="display mt-10 text-4xl">Nothing in the bag</p>
              <p className="mx-auto mt-5 max-w-[36ch] text-sm leading-relaxed text-ash">
                The drop moves fast and the runs are small. Sizes go first.
              </p>
              <div className="mt-10">
                <ButtonLink href="/shop" arrow>
                  Shop the drop
                </ButtonLink>
              </div>
            </div>
          ) : (
            <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
              <div>
                <div className="flex items-center justify-between border-b border-line pb-5">
                  <h2 className="label text-ash">Items</h2>
                  <button
                    onClick={clear}
                    className="label text-ash underline-offset-4 transition-colors hover:text-red hover:underline"
                  >
                    Clear bag
                  </button>
                </div>

                <ul className="divide-y divide-line">
                  {lines.map((line) => (
                    <li key={line.id} className="flex gap-6 py-8">
                      <Link
                        href={`/shop/${line.slug}`}
                        className="relative aspect-4/5 w-28 shrink-0 overflow-hidden bg-bone-2 sm:w-36"
                      >
                        <Image
                          src={line.image}
                          alt={line.name}
                          fill
                          sizes="144px"
                          className="object-cover grayscale transition-transform duration-500 hover:scale-105"
                        />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-6">
                          <div className="min-w-0">
                            <Link
                              href={`/shop/${line.slug}`}
                              className="label transition-colors hover:text-red"
                            >
                              {line.name}
                            </Link>
                            <p className="mt-2 text-xs text-ash">
                              {line.subtitle}
                            </p>
                            <p className="label mt-3 text-[0.5625rem] text-ash">
                              Size {line.size}
                            </p>
                          </div>
                          <p className="display shrink-0 text-xl">
                            {money(line.price * line.qty)}
                          </p>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-5">
                          <div className="flex items-center border border-line">
                            <button
                              onClick={() => setQty(line.id, line.qty - 1)}
                              aria-label={`Decrease quantity of ${line.name}`}
                              className="px-3.5 py-2.5 text-ash transition-colors hover:bg-ink hover:text-bone"
                            >
                              −
                            </button>
                            <span className="label w-10 text-center">
                              {line.qty}
                            </span>
                            <button
                              onClick={() => setQty(line.id, line.qty + 1)}
                              aria-label={`Increase quantity of ${line.name}`}
                              className="px-3.5 py-2.5 text-ash transition-colors hover:bg-ink hover:text-bone"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => remove(line.id)}
                            className="label text-ash underline-offset-4 transition-colors hover:text-red hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ---------------------------- summary --------------------------- */}
              <aside className="lg:sticky lg:top-32 lg:self-start">
                <div className="bg-ink p-8 text-bone md:p-10">
                  <h2 className="label text-bone/45">Summary</h2>

                  <dl className="mt-8 space-y-4 border-b border-white/12 pb-8">
                    <div className="flex justify-between text-sm">
                      <dt className="text-bone/60">Subtotal</dt>
                      <dd>{money(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-bone/60">Shipping</dt>
                      <dd className={shipping === 0 ? "text-red" : undefined}>
                        {shipping === 0 ? "Free" : money(shipping)}
                      </dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-bone/60">Taxes</dt>
                      <dd className="text-bone/60">At checkout</dd>
                    </div>
                  </dl>

                  <div className="mt-8 flex items-baseline justify-between">
                    <span className="label text-bone/45">Total</span>
                    <span className="display text-3xl">
                      {money(subtotal + shipping)}
                    </span>
                  </div>

                  <Button
                    variant="red"
                    className="mt-9 w-full hover:bg-bone hover:text-ink"
                    arrow
                  >
                    Checkout
                  </Button>

                  <p className="label mt-5 text-center text-[0.5625rem] text-bone/35">
                    Demo store — no payment is taken
                  </p>
                </div>

                <Link
                  href="/shop"
                  className="label group mt-6 inline-flex items-center gap-2.5 transition-colors hover:text-red"
                >
                  <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                    ←
                  </span>
                  Keep shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
