import Link from "next/link";
import { Marquee } from "./motion";
import { RegisterMark } from "./texture";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "The Drop", href: "/shop" },
      { label: "Movement", href: "/shop?c=movement" },
      { label: "Archive", href: "/shop?c=archive" },
      { label: "Lookbook", href: "/lookbook" },
    ],
  },
  {
    title: "Info",
    links: [
      { label: "Fabric", href: "/fabric" },
      { label: "Sizing", href: "/fabric#sizing" },
      { label: "Shipping", href: "/fabric#shipping" },
      { label: "Returns", href: "/fabric#returns" },
    ],
  },
  {
    title: "Follow",
    links: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "TikTok", href: "https://tiktok.com" },
      { label: "YouTube", href: "https://youtube.com" },
      { label: "Newsletter", href: "/#newsletter" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative bg-ink text-bone">
      <div className="border-b border-white/12 py-5">
        <Marquee reverse>
          {["Move different", "Live your vibes", "Collection '26"].map((t) => (
            <span key={t} className="label flex items-center text-bone/55">
              <span className="px-8">{t}</span>
              <span className="text-red">✳</span>
            </span>
          ))}
        </Marquee>
      </div>

      <div className="mx-auto grid max-w-[110rem] gap-14 px-5 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)] md:px-10 md:py-20">
        <div>
          <p className="label text-sm tracking-[0.28em]">
            Eik<span className="text-red">one</span>
          </p>
          <p className="mt-6 max-w-[34ch] text-sm leading-relaxed text-bone/60">
            Heavyweight cotton, cut for the walk between places. Printed in
            small runs, sold until the sizes run out.
          </p>
          <div className="mt-8 flex items-center gap-3 text-bone/35">
            <RegisterMark className="h-4 w-4" />
            <span className="label text-[0.625rem]">Est. 2026 · Worldwide</span>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="label text-bone/45">{col.title}</h3>
            <ul className="mt-6 space-y-3.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-bone/80 underline-offset-4 transition-colors duration-300 hover:text-red hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Oversized wordmark, cropped by the viewport like a printed poster. */}
      <div className="overflow-hidden px-5 md:px-10">
        <p
          className="display w-full text-center leading-[0.78] text-bone/8 select-none"
          style={{ fontSize: "clamp(4rem, 19vw, 20rem)" }}
          aria-hidden="true"
        >
          Eikone
        </p>
      </div>

      <div className="mx-auto flex max-w-[110rem] flex-col gap-3 border-t border-white/12 px-5 py-6 text-[0.625rem] tracking-[0.18em] text-bone/40 uppercase md:flex-row md:items-center md:justify-between md:px-10">
        <p className="font-mono">© 2026 Eikone. All rights reserved.</p>
        <p className="font-mono">
          Design demo · Built with Next.js
        </p>
      </div>
    </footer>
  );
}
