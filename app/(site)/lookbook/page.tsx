import type { Metadata } from "next";
import Image from "next/image";
import { PageHead } from "@/components/page-head";
import { Parallax, Reveal } from "@/components/motion";
import { Newsletter, TickerBar } from "@/components/sections";
import { BrushStroke, HalftoneBlock, TapeScrap } from "@/components/texture";
import { ButtonLink } from "@/components/button";

export const metadata: Metadata = {
  title: "Lookbook",
  description:
    "Collection '26 shot on location across six cities — Tokyo, Berlin, New York, Lagos, São Paulo, Seoul.",
};

const SPREADS = [
  {
    city: "Tokyo",
    coords: "35.68° N",
    note: "Shibuya scramble, 2am. Waffle tee under a borrowed jacket.",
    main: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=80",
    mainAlt: "Model wearing the Movement waffle tee against a concrete wall",
    inset:
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
    insetAlt: "Tee hung against a raw concrete wall",
  },
  {
    city: "Berlin",
    coords: "52.52° N",
    note: "Warschauer at first light. White tee, cap down, still going.",
    main: "https://images.unsplash.com/photo-1622445275576-721325763afe?auto=format&fit=crop&w=1200&q=80",
    mainAlt: "Model in a white tee adjusting a cap at first light",
    inset:
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80",
    insetAlt: "Collar and shoulder stitch detail",
  },
  {
    city: "New York",
    coords: "40.71° N",
    note: "Canal St, midweek. Concrete pocket tee doing the heavy lifting.",
    main: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80",
    mainAlt: "Racks of garments inside the studio stockroom",
    inset:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
    insetAlt: "Rail of outerwear hanging in the studio",
  },
];

export default function LookbookPage() {
  return (
    <>
      <PageHead
        eyebrow="Collection '26"
        title={
          <>
            Shot on
            <br />
            location
          </>
        }
        lede="Three spreads from six cities. No studio, no seamless backdrop — every frame was taken where the pieces actually get worn."
        accent
      />

      <TickerBar />

      {SPREADS.map((spread, i) => {
        const flipped = i % 2 === 1;
        return (
          <section
            key={spread.city}
            className="relative overflow-hidden py-20 md:py-28"
          >
            <div className="mx-auto max-w-[110rem] px-5 md:px-10">
              <div
                className={`grid items-center gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20 ${
                  flipped ? "lg:[direction:rtl]" : ""
                }`}
              >
                <div className={flipped ? "lg:[direction:ltr]" : ""}>
                  <Parallax speed={i % 2 === 0 ? -0.05 : 0.05}>
                    <Reveal>
                      <div
                        className={`collage-card ${
                          flipped ? "rotate-[1.2deg]" : "rotate-[-1.2deg]"
                        }`}
                      >
                        <div className="relative aspect-16/10 overflow-hidden bg-bone-2">
                          <Image
                            src={spread.main}
                            alt={spread.mainAlt}
                            fill
                            sizes="(max-width: 1024px) 92vw, 60vw"
                            className="object-cover grayscale transition-all duration-1000 hover:grayscale-0"
                          />
                        </div>
                      </div>
                    </Reveal>
                  </Parallax>
                </div>

                <div className={`relative ${flipped ? "lg:[direction:ltr]" : ""}`}>
                  <Reveal delay={120}>
                    <p className="label text-red">
                      Spread {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2
                      className="display relative mt-5 inline-block"
                      style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
                    >
                      {spread.city}
                      {i === 0 && (
                        <BrushStroke className="absolute -bottom-[0.02em] -left-2 -z-10 h-[0.15em] w-[104%] opacity-90" />
                      )}
                    </h2>
                    <p className="label mt-5 text-ash">{spread.coords}</p>
                    <p className="mt-7 max-w-[36ch] text-sm leading-relaxed text-ash">
                      {spread.note}
                    </p>
                  </Reveal>

                  <Reveal delay={220}>
                    <Parallax speed={0.08} className="mt-10 w-2/3 lg:w-full">
                      <div
                        className={`collage-card ${
                          flipped ? "rotate-[-2.5deg]" : "rotate-[2.5deg]"
                        }`}
                      >
                        <div className="relative aspect-square overflow-hidden bg-bone-2">
                          <Image
                            src={spread.inset}
                            alt={spread.insetAlt}
                            fill
                            sizes="(max-width: 1024px) 50vw, 25vw"
                            className="object-cover grayscale"
                          />
                        </div>
                      </div>
                    </Parallax>
                  </Reveal>

                  <TapeScrap
                    className={`pointer-events-none absolute -top-6 h-9 w-28 ${
                      flipped ? "right-4 rotate-[8deg]" : "left-4 rotate-[-8deg]"
                    }`}
                  />
                </div>
              </div>
            </div>

            <HalftoneBlock
              className={`pointer-events-none absolute top-1/3 h-40 w-40 opacity-50 ${
                flipped ? "-left-10" : "-right-10"
              }`}
            />
          </section>
        );
      })}

      <section className="border-t border-line py-20 text-center md:py-28">
        <div className="mx-auto max-w-[110rem] px-5 md:px-10">
          <Reveal>
            <h2
              className="display"
              style={{ fontSize: "clamp(2.25rem, 6vw, 5rem)" }}
            >
              Wear it
              <br />
              your way
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-10">
              <ButtonLink href="/shop" arrow>
                Shop the drop
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
