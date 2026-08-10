"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { money, type Product } from "@/lib/products";
import { Button } from "./button";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const soldOut = product.soldOutSizes ?? [];
  const firstAvailable = product.sizes.find((s) => !soldOut.includes(s));

  const [size, setSize] = useState<string | undefined>(firstAvailable);
  const [qty, setQty] = useState(1);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="label">Size</h2>
        <button
          type="button"
          className="label text-ash underline-offset-4 transition-colors hover:text-red hover:underline"
        >
          Size guide
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {product.sizes.map((s) => {
          const isSoldOut = soldOut.includes(s);
          const isActive = size === s;
          return (
            <button
              key={s}
              type="button"
              disabled={isSoldOut}
              onClick={() => setSize(s)}
              aria-pressed={isActive}
              className={`label relative min-w-14 border px-4 py-3.5 transition-colors duration-300 ${
                isActive
                  ? "border-ink bg-ink text-bone"
                  : "border-line text-ink hover:border-ink"
              } ${
                isSoldOut
                  ? "cursor-not-allowed border-line text-ash/45 hover:border-line"
                  : ""
              }`}
            >
              {s}
              {isSoldOut && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-1.5 top-1/2 h-px -rotate-12 bg-ash/45"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-stretch gap-3">
        <div className="flex items-center border border-line">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="px-4 py-3.5 text-ash transition-colors hover:bg-ink hover:text-bone"
          >
            −
          </button>
          <span className="label w-10 text-center">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(10, q + 1))}
            aria-label="Increase quantity"
            className="px-4 py-3.5 text-ash transition-colors hover:bg-ink hover:text-bone"
          >
            +
          </button>
        </div>

        <Button
          className="flex-1"
          disabled={!size}
          onClick={() => size && add(product, size, qty)}
        >
          {size
            ? `Add to bag — ${money(product.price * qty)}`
            : "Select a size"}
        </Button>
      </div>

      <ul className="mt-8 space-y-2.5 border-t border-line pt-6 text-xs text-ash">
        <li className="flex items-center gap-3">
          <span className="h-1 w-1 shrink-0 bg-red" />
          Free shipping over ₵150 · ships in 2 business days
        </li>
        <li className="flex items-center gap-3">
          <span className="h-1 w-1 shrink-0 bg-red" />
          30-day returns on unworn pieces
        </li>
      </ul>
    </div>
  );
}
