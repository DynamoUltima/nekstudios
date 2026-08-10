import Image from "next/image";
import { ButtonLink, Eyebrow } from "./button";
import { Parallax, Reveal } from "./motion";
import { BrushStroke, HalftoneBlock, TapeScrap, TornStrip } from "./texture";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-28 pb-14 md:pt-30 lg:pt-32">
      {/* Vertical torn paper seam splitting copy from collage */}
      <TornStrip className="pointer-events-none absolute top-0 -left-6 hidden h-full w-28 opacity-90 lg:block lg:left-[46%]" />

      <div className="mx-auto grid max-w-[110rem] items-center gap-16 px-5 md:px-10 lg:grid-cols-2 lg:gap-8">
        {/* ------------------------------- copy ------------------------------- */}
        <div className="relative z-10 lg:pr-16">
          <Reveal>
            <Eyebrow className="flex items-center gap-3">
              <span className="inline-block h-1.5 w-1.5 bg-red" />
              Vibes in motion · Collection &apos;26
            </Eyebrow>
          </Reveal>

          <Reveal delay={90}>
            <h1
              className="display mt-7 text-ink"
              style={{ fontSize: "clamp(3.5rem, 10vw, 8.5rem)" }}
            >
              Own
              <br />
              The
              <br />
              Streets
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-8 max-w-[38ch] text-base leading-relaxed text-ash md:text-lg">
              Built for your movement. Waffle-structure heavyweight cotton that
              breathes when the city does.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-10 flex flex-wrap gap-3.5">
              <ButtonLink href="/shop" arrow>
                Shop the Drop
              </ButtonLink>
              <ButtonLink href="/fabric" variant="outline">
                See the Fabric
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={340}>
            <dl className="mt-11 flex gap-10 border-t border-line pt-6">
              {[
                ["260", "GSM cotton"],
                ["3", "Pass print"],
                ["6", "Cities"],
              ].map(([n, label]) => (
                <div key={label}>
                  <dt className="display text-3xl md:text-4xl">{n}</dt>
                  <dd className="label mt-2 text-ash">{label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* ------------------------------ collage ----------------------------- */}
        <div className="relative h-[30rem] sm:h-[36rem] lg:h-[38rem]">
          {/* Halftone depth block behind everything */}
          <HalftoneBlock className="absolute top-6 left-2 h-64 w-52 rotate-[-4deg] sm:h-80 sm:w-64" />

          {/* Back photo — the wall */}
          <Parallax speed={0.06} className="absolute top-4 left-0 w-[46%]">
            <Reveal>
              <div className="collage-card rotate-[-2.5deg]">
                <div className="relative aspect-3/4 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=80"
                    alt="Heavyweight tee hung against a raw concrete wall"
                    fill
                    sizes="(max-width: 1024px) 45vw, 22vw"
                    className="object-cover contrast-125 grayscale"
                    priority
                  />
                </div>
              </div>
            </Reveal>
          </Parallax>

          {/* Red brush stroke crossing the collage */}
          <BrushStroke className="absolute top-[38%] left-[6%] z-20 h-20 w-[62%] rotate-[-6deg] sm:h-24" />

          {/* Hero photo — the model */}
          <Parallax speed={-0.09} className="absolute top-16 right-0 w-[62%]">
            <Reveal delay={140}>
              <div className="collage-card rotate-[1.5deg]">
                <div className="relative aspect-4/5 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=80"
                    alt="Model wearing a heavyweight tee against a concrete wall"
                    fill
                    sizes="(max-width: 1024px) 62vw, 32vw"
                    className="object-cover object-top contrast-110 grayscale"
                    priority
                  />
                </div>
              </div>
            </Reveal>
          </Parallax>

          {/* Second brush stroke, lower left */}
          <BrushStroke className="absolute bottom-[16%] left-0 z-20 h-16 w-[48%] rotate-[3deg] sm:h-20" />

          {/* Paper scraps */}
          <TapeScrap className="absolute top-[26%] left-[-4%] z-10 h-10 w-32 rotate-[-8deg] opacity-95" />
          <TapeScrap
            className="absolute right-[-3%] bottom-[8%] z-30 h-9 w-28 rotate-[6deg]"
            tone="#dcd4c0"
          />

          {/* Price tag pinned to the collage. The absolute positioning lives on
              the Reveal wrapper — [data-reveal] carries a transform, which would
              otherwise make it the containing block for an absolute child. */}
          <Reveal delay={320} className="absolute bottom-4 left-2 z-30 sm:bottom-8">
            <div className="rotate-[-3deg] bg-ink px-5 py-3.5 text-bone">
              <p className="label text-[0.625rem] text-bone/55">Featured</p>
              <p className="label mt-1.5">Own The Streets · ₵68</p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Footline */}
      <Reveal delay={420}>
        <p className="label mt-16 text-center text-ash lg:mt-10">
          Move different. Live your vibes.
        </p>
      </Reveal>
    </section>
  );
}
