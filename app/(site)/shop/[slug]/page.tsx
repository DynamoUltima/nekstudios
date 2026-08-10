import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { Eyebrow } from "@/components/button";
import { Reveal } from "@/components/motion";
import { ProductCard } from "@/components/product-card";
import { BrushStroke, HalftoneBlock, TapeScrap } from "@/components/texture";
import { getProduct, getProducts } from "@/lib/catalogue";
import { money } from "@/lib/products";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Not found" };

  return {
    title: `${product.name} — ${product.subtitle}`,
    description: product.description,
    openGraph: { images: [product.image] },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = (await getProducts())
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);

  return (
    <>
      <div className="mx-auto max-w-[110rem] px-5 pt-32 md:px-10 md:pt-40">
        <nav className="label flex items-center gap-2.5 text-ash">
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span className="text-red">/</span>
          <Link href="/shop" className="transition-colors hover:text-ink">
            Shop
          </Link>
          <span className="text-red">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </div>

      <section className="py-12 md:py-16">
        <div className="mx-auto grid max-w-[110rem] gap-14 px-5 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          {/* ----------------------------- gallery ---------------------------- */}
          <div className="relative">
            <HalftoneBlock className="absolute -top-6 -left-6 -z-10 hidden h-48 w-48 md:block" />

            <Reveal>
              <div className="collage-card rotate-[-1deg]">
                <div className="relative aspect-4/5 overflow-hidden bg-bone-2">
                  <Image
                    src={product.image}
                    alt={product.alt ?? `${product.name} ${product.subtitle}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 92vw, 50vw"
                    className="object-cover grayscale"
                  />
                </div>
              </div>
            </Reveal>

            <div className="mt-6 grid grid-cols-2 gap-6">
              <Reveal delay={120}>
                <div className="collage-card rotate-[1.5deg]">
                  <div className="relative aspect-square overflow-hidden bg-bone-2">
                    <Image
                      src={product.imageAlt}
                      alt={`${product.name} detail shot`}
                      fill
                      sizes="(max-width: 1024px) 45vw, 25vw"
                      className="object-cover grayscale"
                    />
                  </div>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="relative flex h-full flex-col justify-between bg-ink p-6 text-bone">
                  <div>
                    <p className="label text-bone/45">Fabric</p>
                    <p className="mt-3 text-sm leading-relaxed text-bone/85">
                      {product.fabric}
                    </p>
                  </div>
                  <div className="mt-8">
                    <p className="display text-5xl">{product.weightGsm}</p>
                    <p className="label mt-2 text-bone/45">GSM</p>
                  </div>
                  <BrushStroke className="pointer-events-none absolute -bottom-4 -left-3 h-12 w-2/3 rotate-[-5deg]" />
                </div>
              </Reveal>
            </div>

            <TapeScrap className="pointer-events-none absolute -top-4 right-8 h-9 w-28 rotate-[7deg]" />
          </div>

          {/* ------------------------------ detail ---------------------------- */}
          <div className="lg:pt-6">
            <Reveal>
              <Eyebrow className="flex items-center gap-3">
                <span className="inline-block h-1.5 w-1.5 bg-red" />
                {product.collection} · {product.colorway}
              </Eyebrow>
            </Reveal>

            <Reveal delay={70}>
              <h1
                className="display mt-6"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
              >
                {product.name}
              </h1>
              <p className="mt-4 text-sm text-ash">{product.subtitle}</p>
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-8 flex items-baseline gap-4">
                <span className="display text-3xl">{money(product.price)}</span>
                {product.compareAt && (
                  <span className="label text-ash line-through">
                    {money(product.compareAt)}
                  </span>
                )}
                {product.status && (
                  <span className="label bg-red px-2.5 py-1.5 text-[0.5625rem] text-white">
                    {product.status}
                  </span>
                )}
              </div>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-9 max-w-[52ch] text-sm leading-relaxed text-ash">
                {product.description}
              </p>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-11 border-t border-line pt-9">
                <AddToCart product={product} />
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-12 border-t border-line pt-9">
                <h2 className="label">Details</h2>
                <ul className="mt-5 space-y-3.5">
                  {product.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex gap-4 text-sm leading-relaxed text-ash"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 bg-red" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ----------------------------- related ---------------------------- */}
      <section className="border-t border-line py-20 md:py-28">
        <div className="mx-auto max-w-[110rem] px-5 md:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2
              className="display"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              Wears well
              <br />
              with
            </h2>
            <Link
              href="/shop"
              className="label group inline-flex items-center gap-2.5 transition-colors hover:text-red"
            >
              All pieces
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 100}>
                <ProductCard product={p} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
