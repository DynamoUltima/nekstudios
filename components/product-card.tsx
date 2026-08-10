import Image from "next/image";
import Link from "next/link";
import { money, type Product } from "@/lib/products";

const STATUS_TONE: Record<string, string> = {
  NEW: "bg-red text-white",
  "LOW STOCK": "bg-ink text-bone",
  "SOLD OUT": "bg-bone-2 text-ash",
  RESTOCK: "bg-ink text-bone",
};

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group relative block"
      // Alternating lift keeps the grid feeling like a pinned collage.
      style={{ marginTop: index % 2 === 1 ? "2.5rem" : undefined }}
    >
      <div className="collage-card transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:rotate-[-0.6deg]">
        <div className="relative aspect-4/5 overflow-hidden bg-bone-2">
          <Image
            src={product.image}
            alt={product.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 30vw"
            className="object-cover grayscale transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-0"
          />
          <Image
            src={product.imageAlt}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 30vw"
            className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100"
          />

          {product.status && (
            <span
              className={`label absolute top-3 left-3 px-2.5 py-1.5 text-[0.5625rem] ${
                STATUS_TONE[product.status]
              }`}
            >
              {product.status}
            </span>
          )}

          {/* Slide-up shop bar */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-ink px-4 py-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0">
            <span className="label flex items-center justify-between text-bone">
              View piece
              <span className="text-red">→</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="label truncate transition-colors duration-300 group-hover:text-red">
            {product.name}
          </h3>
          <p className="mt-1.5 truncate text-xs text-ash">
            {product.subtitle} · {product.colorway}
          </p>
        </div>
        <p className="label shrink-0">
          {product.compareAt && (
            <span className="mr-2 text-ash line-through">
              {money(product.compareAt)}
            </span>
          )}
          {money(product.price)}
        </p>
      </div>
    </Link>
  );
}
