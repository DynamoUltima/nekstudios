import { ButtonLink } from "@/components/button";
import { SiteChrome } from "@/components/site-chrome";
import { BrushStroke, HalftoneBlock } from "@/components/texture";

// Unmatched URLs resolve against the root layout, which no longer carries the
// storefront chrome — so this page brings its own.
export default function NotFound() {
  return (
    <SiteChrome>
      <section className="relative flex min-h-[80svh] items-center overflow-hidden py-32">
        <HalftoneBlock className="pointer-events-none absolute top-1/4 -left-10 h-64 w-64 opacity-60" />

        <div className="mx-auto max-w-[110rem] px-5 md:px-10">
          <p className="label text-red">Error 404</p>
          <h1
            className="display relative mt-7 inline-block"
            style={{ fontSize: "clamp(3.5rem, 12vw, 10rem)" }}
          >
            Sold out
            <br />
            of page
            <BrushStroke className="absolute -bottom-[0.02em] -left-3 -z-10 h-[0.15em] w-[104%] opacity-90" />
          </h1>
          <p className="mt-9 max-w-[40ch] text-sm leading-relaxed text-ash">
            This one isn&apos;t in the run. Head back to the drop — those are
            still moving.
          </p>
          <div className="mt-11 flex flex-wrap gap-3.5">
            <ButtonLink href="/shop" arrow>
              Shop the drop
            </ButtonLink>
            <ButtonLink href="/" variant="outline">
              Home
            </ButtonLink>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
