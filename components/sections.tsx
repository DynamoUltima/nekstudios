import Image from "next/image";
import Link from "next/link";
import { ButtonLink, Eyebrow } from "./button";
import { CountUp, Marquee, Parallax, Reveal } from "./motion";
import { ProductCard } from "./product-card";
import {
  BrushStroke,
  HalftoneBlock,
  RegisterMark,
  TapeScrap,
  TornSeam,
} from "./texture";
import { getProducts } from "@/lib/catalogue";
import { NewsletterForm } from "./newsletter-form";

/* ------------------------------- ticker bar ------------------------------- */

export function TickerBar() {
  const items = [
    "Collection '26 out now",
    "Free shipping over ₵150",
    "Printed in small runs",
    "Sizes go first",
  ];

  return (
    <div className="border-y border-line bg-ink py-3.5 text-bone">
      <Marquee>
        {items.map((t) => (
          <span key={t} className="label flex items-center">
            <span className="px-8">{t}</span>
            <span className="text-red">✳</span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}

/* -------------------------------- the drop -------------------------------- */

export async function DropGrid() {
  const featured = (await getProducts()).slice(0, 3);

  return (
    <section id="drop" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[110rem] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-line pb-8">
          <div>
            <Reveal>
              <Eyebrow className="flex items-center gap-3">
                <span className="inline-block h-1.5 w-1.5 bg-red" />
                The Drop · 01
              </Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="display mt-6"
                style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)" }}
              >
                Wear the
                <br />
                weight
              </h2>
            </Reveal>
          </div>

          <Reveal delay={160}>
            <div className="max-w-[36ch]">
              <p className="text-sm leading-relaxed text-ash">
                Six pieces. Each one cut heavy, printed by hand, and made in a
                run small enough that we know the number by heart.
              </p>
              <Link
                href="/shop"
                className="label group mt-6 inline-flex items-center gap-2.5 text-ink transition-colors hover:text-red"
              >
                All pieces
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product, i) => (
            <Reveal key={product.slug} delay={i * 110}>
              <ProductCard product={product} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- fabric --------------------------------- */

const FABRIC_POINTS = [
  {
    n: "01",
    title: "Waffle structure",
    body: "An open weave that traps air instead of heat. The shirt moves air across the body so it keeps working past the first mile.",
  },
  {
    n: "02",
    title: "260 GSM, garment dyed",
    body: "Heavy enough to hold a boxed shoulder without a single stiffener. Dyed after cutting so the colour sits deep and fades honestly.",
  },
  {
    n: "03",
    title: "Three-pass hand print",
    body: "Pulled by hand, three passes, cured between each. The ink sits on the fabric rather than soaking into it — so it cracks the way it should.",
  },
];

export function FabricSection() {
  return (
    <section id="fabric" className="relative bg-ink py-24 text-bone md:py-32">
      <TornSeam className="absolute -top-px left-0 h-6 w-full rotate-180" />

      <div className="mx-auto grid max-w-[110rem] gap-16 px-5 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-24">
        <div className="relative">
          <Parallax speed={-0.05}>
            <Reveal>
              <div className="relative aspect-4/5 overflow-hidden bg-white/5">
                <Image
                  src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1100&q=80"
                  alt="Close crop of heavyweight waffle-structure cotton"
                  fill
                  sizes="(max-width: 1024px) 92vw, 42vw"
                  className="object-cover grayscale"
                />
              </div>
            </Reveal>
          </Parallax>

          <BrushStroke className="absolute -bottom-6 -left-4 z-10 h-20 w-2/3 rotate-[-4deg]" />
          <HalftoneBlock
            className="absolute -top-8 -right-8 hidden h-40 w-40 md:block"
            tone="text-bone/40"
          />

          <Reveal delay={200} className="absolute top-6 -right-4 md:-right-10">
            <div className="rotate-[3deg] bg-bone px-5 py-4 text-ink">
              <p className="display text-4xl">260</p>
              <p className="label mt-1.5 text-ash">GSM</p>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col justify-center">
          <Reveal>
            <Eyebrow className="flex items-center gap-3">
              <span className="inline-block h-1.5 w-1.5 bg-red" />
              The Fabric
            </Eyebrow>
          </Reveal>

          <Reveal delay={80}>
            <h2
              className="display mt-6"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5.25rem)" }}
            >
              Breathes
              <br />
              when the
              <br />
              <span className="text-red">city does</span>
            </h2>
          </Reveal>

          <div className="mt-14 divide-y divide-white/12 border-t border-white/12">
            {FABRIC_POINTS.map((point, i) => (
              <Reveal key={point.n} delay={i * 100}>
                <div className="group flex gap-6 py-7 md:gap-10">
                  <span className="label pt-1 text-bone/35 transition-colors duration-300 group-hover:text-red">
                    {point.n}
                  </span>
                  <div>
                    <h3 className="label text-bone">{point.title}</h3>
                    <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-bone/55">
                      {point.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={340}>
            <div className="mt-10">
              <ButtonLink
                href="/fabric"
                variant="red"
                arrow
                className="hover:bg-bone hover:text-ink"
              >
                Full spec sheet
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>

      <TornSeam className="absolute -bottom-px left-0 h-6 w-full" />
    </section>
  );
}

/* -------------------------------- lookbook -------------------------------- */

const LOOKS = [
  {
    src: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=80",
    alt: "Model in washed black tee against a concrete underpass",
    label: "Look 01 · Underpass",
    span: "col-span-2 row-span-2",
    rotate: "rotate-[-1.5deg]",
  },
  {
    src: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=700&q=80",
    alt: "Racks of garments inside the studio stockroom",
    label: "Look 02 · Stockroom",
    span: "col-span-1 row-span-1",
    rotate: "rotate-[2deg]",
  },
  {
    src: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=700&q=80",
    alt: "Rail of outerwear hanging in the studio",
    label: "Look 03 · The rail",
    span: "col-span-1 row-span-1",
    rotate: "rotate-[-2.5deg]",
  },
  {
    src: "https://images.unsplash.com/photo-1622445275576-721325763afe?auto=format&fit=crop&w=900&q=80",
    alt: "Model in a white tee adjusting a cap outdoors",
    label: "Look 04 · Streetside",
    span: "col-span-2 row-span-1",
    rotate: "rotate-[1deg]",
  },
];

export function Lookbook() {
  return (
    <section id="lookbook" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[110rem] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Reveal>
              <Eyebrow className="flex items-center gap-3">
                <span className="inline-block h-1.5 w-1.5 bg-red" />
                Lookbook
              </Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="display mt-6"
                style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)" }}
              >
                Shot on
                <br />
                location
              </h2>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <ButtonLink href="/lookbook" variant="outline" arrow>
              Full lookbook
            </ButtonLink>
          </Reveal>
        </div>

        <div className="mt-14 grid auto-rows-[13rem] grid-cols-2 gap-4 md:auto-rows-[16rem] md:grid-cols-4 md:gap-6">
          {LOOKS.map((look, i) => (
            <Reveal
              key={look.label}
              delay={i * 90}
              className={`${look.span} min-h-0`}
            >
              <figure
                className={`group collage-card h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 ${look.rotate} hover:rotate-0`}
              >
                <div className="relative h-full overflow-hidden bg-bone-2">
                  <Image
                    src={look.src}
                    alt={look.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                  <figcaption className="label absolute bottom-3 left-3 bg-bone/90 px-2.5 py-1.5 text-[0.5625rem] text-ink">
                    {look.label}
                  </figcaption>
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>

      <TapeScrap className="pointer-events-none absolute top-1/2 -left-6 h-12 w-40 rotate-[-12deg] opacity-70" />
    </section>
  );
}

/* --------------------------------- cities --------------------------------- */

const CITIES = [
  { name: "Tokyo", meta: "35.68° N", note: "Shibuya scramble, 2am" },
  { name: "Berlin", meta: "52.52° N", note: "Warschauer, first light" },
  { name: "New York", meta: "40.71° N", note: "Canal St, midweek" },
  { name: "Lagos", meta: "6.52° N", note: "Yaba, market hours" },
  { name: "São Paulo", meta: "23.55° S", note: "Vila Madalena, dusk" },
  { name: "Seoul", meta: "37.57° N", note: "Hongdae, closing time" },
];

export function Cities() {
  return (
    <section id="cities" className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-[110rem] px-5 md:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <Reveal>
              <Eyebrow className="flex items-center gap-3">
                <span className="inline-block h-1.5 w-1.5 bg-red" />
                Cities
              </Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="display mt-6"
                style={{ fontSize: "clamp(2.75rem, 7vw, 5.5rem)" }}
              >
                Six on
                <br />
                the back
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-8 max-w-[38ch] text-sm leading-relaxed text-ash">
                Every piece in the collection was shot, worn, and worn out in
                one of these six. The tour tee carries all of them.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-12 flex gap-10 border-t border-line pt-8">
                <div>
                  <p className="display text-4xl">
                    <CountUp to={6} />
                  </p>
                  <p className="label mt-2 text-ash">Cities</p>
                </div>
                <div>
                  <p className="display text-4xl">
                    <CountUp to={340} />
                  </p>
                  <p className="label mt-2 text-ash">Pieces per run</p>
                </div>
              </div>
            </Reveal>
          </div>

          <ul className="divide-y divide-line border-y border-line">
            {CITIES.map((city, i) => (
              <Reveal key={city.name} delay={i * 70} as="li">
                <div className="group flex items-center justify-between gap-6 py-6 transition-colors duration-300 md:py-7">
                  <div className="flex items-baseline gap-5 md:gap-8">
                    <span className="label text-ash transition-colors duration-300 group-hover:text-red">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="display transition-transform duration-500 ease-out group-hover:translate-x-2"
                      style={{ fontSize: "clamp(1.75rem, 4vw, 3.25rem)" }}
                    >
                      {city.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="label text-ash">{city.meta}</p>
                    <p className="mt-1.5 hidden text-xs text-ash/70 sm:block">
                      {city.note}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>

      <HalftoneBlock className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 opacity-60" />
    </section>
  );
}

/* ------------------------------- newsletter ------------------------------- */

export function Newsletter() {
  return (
    <section id="newsletter" className="relative overflow-hidden bg-bone-2 py-24 md:py-32">
      <TornSeam className="absolute -top-px left-0 h-6 w-full rotate-180" />

      <div className="mx-auto max-w-[110rem] px-5 md:px-10">
        <div className="relative mx-auto max-w-3xl text-center">
          <RegisterMark className="mx-auto h-5 w-5 text-red" />

          <Reveal delay={60}>
            <h2
              className="display mt-8"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
            >
              Get early
              <br />
              access
            </h2>
          </Reveal>

          <Reveal delay={140}>
            <p className="mx-auto mt-7 max-w-[42ch] text-sm leading-relaxed text-ash">
              Drops go to the list twenty-four hours before they go public. No
              noise between drops — we only write when there is something to
              sell.
            </p>
          </Reveal>

          <Reveal delay={220}>
            <NewsletterForm />
          </Reveal>

          <BrushStroke className="pointer-events-none absolute -top-10 -left-16 -z-10 hidden h-24 w-72 rotate-[-8deg] opacity-80 md:block" />
        </div>
      </div>
    </section>
  );
}
