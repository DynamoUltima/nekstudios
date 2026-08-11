import type { Metadata } from "next";
import { PageHead } from "@/components/page-head";
import { FabricSection, Newsletter } from "@/components/sections";
import { Reveal } from "@/components/motion";
import { Eyebrow } from "@/components/button";

export const metadata: Metadata = {
  title: "The Fabric",
  description:
    "Spec sheet, sizing, shipping and returns for Eikone heavyweight cotton.",
};

const SIZING = [
  { size: "XS", chest: 19.7, length: 26.8, sleeve: 7.9 },
  { size: "S", chest: 20.9, length: 27.6, sleeve: 8.3 },
  { size: "M", chest: 22, length: 28.3, sleeve: 8.7 },
  { size: "L", chest: 23.2, length: 29.1, sleeve: 9.1 },
  { size: "XL", chest: 24.4, length: 29.9, sleeve: 9.4 },
  { size: "XXL", chest: 25.6, length: 30.7, sleeve: 9.8 },
];

const POLICIES = [
  {
    id: "shipping",
    title: "Shipping",
    body: "Orders leave the studio within two business days. Free worldwide over ₵150, flat ₵12 below that. Tracking lands in your inbox the moment the label prints.",
  },
  {
    id: "returns",
    title: "Returns",
    body: "Thirty days on unworn pieces with tags attached. Send it back and we'll refund the piece — you cover return postage unless something went wrong on our end.",
  },
  {
    id: "care",
    title: "Care",
    body: "Cold wash, inside out, hang dry. Skip the tumble dryer and the print stays sharp through the life of the shirt. Never iron directly over a print.",
  },
];

export default function FabricPage() {
  return (
    <>
      <PageHead
        eyebrow="Spec sheet"
        title={
          <>
            The
            <br />
            Fabric
          </>
        }
        lede="Everything about what the shirt is made of, how it fits, and what happens after you buy it. No mystery, no marketing weight."
        accent
      />

      <FabricSection />

      {/* --------------------------------- sizing -------------------------------- */}
      <section id="sizing" className="scroll-mt-28 py-24 md:py-32">
        <div className="mx-auto max-w-[110rem] px-5 md:px-10">
          <Reveal>
            <Eyebrow className="flex items-center gap-3">
              <span className="inline-block h-1.5 w-1.5 bg-red" />
              Sizing
            </Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2
              className="display mt-6"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
            >
              Measure
              <br />
              flat
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-8 max-w-[52ch] text-sm leading-relaxed text-ash">
              All measurements in inches, taken flat across the garment.
              Everything is cut boxed — size down for a closer fit, stay true
              for the intended silhouette.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-12 overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-left">
                <thead>
                  <tr className="border-y border-ink">
                    {["Size", "Chest", "Length", "Sleeve"].map((h) => (
                      <th key={h} className="label py-4 pr-6 text-ash">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {SIZING.map((row) => (
                    <tr
                      key={row.size}
                      className="transition-colors duration-300 hover:bg-bone-2"
                    >
                      <td className="label py-5 pr-6">{row.size}</td>
                      <td className="py-5 pr-6 text-sm text-ash">
                        {row.chest} in
                      </td>
                      <td className="py-5 pr-6 text-sm text-ash">
                        {row.length} in
                      </td>
                      <td className="py-5 pr-6 text-sm text-ash">
                        {row.sleeve} in
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------- policies ------------------------------ */}
      <section className="border-t border-line py-24 md:py-32">
        <div className="mx-auto max-w-[110rem] px-5 md:px-10">
          <div className="grid gap-x-12 gap-y-14 md:grid-cols-3">
            {POLICIES.map((policy, i) => (
              <Reveal key={policy.id} delay={i * 110}>
                <div id={policy.id} className="scroll-mt-28 border-t border-ink pt-7">
                  <h2 className="label">{policy.title}</h2>
                  <p className="mt-5 text-sm leading-relaxed text-ash">
                    {policy.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
