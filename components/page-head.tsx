import { Eyebrow } from "./button";
import { Reveal } from "./motion";
import { BrushStroke } from "./texture";

/** Shared masthead for interior pages. */
export function PageHead({
  eyebrow,
  title,
  lede,
  accent = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
  accent?: boolean;
}) {
  return (
    <header className="relative overflow-hidden pt-36 pb-14 md:pt-44 md:pb-20">
      <div className="mx-auto max-w-[110rem] px-5 md:px-10">
        <Reveal>
          <Eyebrow className="flex items-center gap-3">
            <span className="inline-block h-1.5 w-1.5 bg-red" />
            {eyebrow}
          </Eyebrow>
        </Reveal>

        <Reveal delay={80}>
          <h1
            className="display relative mt-7 inline-block"
            style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}
          >
            {title}
            {accent && (
              <BrushStroke className="absolute -bottom-[0.02em] -left-3 -z-10 h-[0.15em] w-[104%] opacity-90" />
            )}
          </h1>
        </Reveal>

        {lede && (
          <Reveal delay={160}>
            <p className="mt-8 max-w-[52ch] text-base leading-relaxed text-ash">
              {lede}
            </p>
          </Reveal>
        )}
      </div>
    </header>
  );
}
