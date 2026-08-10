import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHead } from "@/components/admin/admin-shell";
import {
  EmptyState,
  Meter,
  Panel,
  Pill,
  StatTile,
  Table,
  Td,
  Th,
  Tr,
} from "@/components/admin/ui";
import { fmtAgo, fmtDate, fmtNumber, fmtPercent } from "@/lib/admin/format";
import { listStats } from "@/lib/admin/metrics";
import { getSubscribers } from "@/lib/admin/store";

export const metadata: Metadata = { title: "The list" };

const SOURCES = ["FOOTER", "NEWSLETTER", "POPUP", "CHECKOUT"] as const;
const PER_PAGE = 40;

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; page?: string }>;
}) {
  const { source, page = "1" } = await searchParams;

  const active = SOURCES.find((s) => s === source?.toUpperCase());
  const [stats, all] = await Promise.all([listStats(), getSubscribers()]);
  const filtered = active ? all.filter((s) => s.source === active) : all;

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(Math.max(1, Number(page) || 1), pageCount);
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const growth =
    stats.previous30 === 0
      ? null
      : ((stats.last30 - stats.previous30) / stats.previous30) * 100;

  return (
    <>
      <AdminPageHead
        eyebrow="Audience"
        title="The list"
        lede="Everyone waiting on the next drop. Early access goes out twenty-four hours ahead of public — this is who gets it."
      />

      <div className="space-y-6 px-5 py-8 md:px-9">
        <div className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
          <StatTile hero label="On the list" value={fmtNumber(stats.total)} />
          <StatTile
            label="Joined · 30 days"
            value={fmtNumber(stats.last30)}
            delta={growth}
            note="vs prev. 30"
          />
          <StatTile
            label="Have bought"
            value={fmtPercent(stats.convertedRate)}
            note="of all subscribers"
          />
          <StatTile
            label="Top source"
            value={stats.bySource[0]?.source ?? "—"}
            note={
              stats.bySource[0]
                ? `${fmtNumber(stats.bySource[0].count)} sign-ups`
                : undefined
            }
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1.6fr]">
          <Panel title="Where they came from">
            <ul className="space-y-4">
              {stats.bySource.map((row) => (
                <li key={row.source} className="flex items-center gap-4">
                  <span className="label w-24 shrink-0 text-ash">{row.source}</span>
                  <Meter
                    value={(row.count / stats.total) * 100}
                    label={`${row.source}: ${row.count} subscribers`}
                  />
                  <span className="label w-14 shrink-0 text-right tabular-nums">
                    {fmtNumber(row.count)}
                  </span>
                </li>
              ))}
            </ul>

            <p className="label mt-8 border-t border-line pt-6 leading-[1.8] text-ash">
              The footer form is the storefront&apos;s only capture point. Sending
              a drop still means exporting this list — no ESP is wired up.
            </p>
          </Panel>

          <Panel
            title={active ? `${active} sign-ups` : "Recent sign-ups"}
            meta={`${fmtNumber(filtered.length)} people`}
            bleed
            action={
              <nav className="flex flex-wrap gap-1.5">
                <Link
                  href="/admin/subscribers"
                  className={`label px-3 py-2 transition-colors ${
                    !active ? "bg-ink text-bone" : "text-ash hover:text-ink"
                  }`}
                >
                  All
                </Link>
                {SOURCES.map((s) => (
                  <Link
                    key={s}
                    href={`/admin/subscribers?source=${s.toLowerCase()}`}
                    className={`label px-3 py-2 transition-colors ${
                      active === s ? "bg-ink text-bone" : "text-ash hover:text-ink"
                    }`}
                  >
                    {s}
                  </Link>
                ))}
              </nav>
            }
          >
            {rows.length === 0 ? (
              <EmptyState
                title="No sign-ups here"
                body="Nobody has joined through this source yet."
              />
            ) : (
              <>
                <Table>
                  <thead>
                    <tr>
                      <Th>Email</Th>
                      <Th>City</Th>
                      <Th>Source</Th>
                      <Th>Joined</Th>
                      <Th align="right">Bought</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((subscriber) => (
                      <Tr key={subscriber.email}>
                        <Td className="break-all">{subscriber.email}</Td>
                        <Td>{subscriber.city}</Td>
                        <Td>
                          <Pill tone="outline">{subscriber.source}</Pill>
                        </Td>
                        <Td>
                          {fmtDate(subscriber.joinedAt)}
                          <span className="mt-1 block text-xs text-ash">
                            {fmtAgo(subscriber.joinedAt)}
                          </span>
                        </Td>
                        <Td align="right">
                          {subscriber.converted ? (
                            <span className="label text-red">Yes</span>
                          ) : (
                            <span className="label text-ash">—</span>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>

                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <p className="label text-ash">
                    Page {current} of {pageCount}
                  </p>
                  <div className="flex gap-2">
                    {current > 1 && (
                      <Link
                        href={`/admin/subscribers?${new URLSearchParams({
                          ...(active ? { source: active.toLowerCase() } : {}),
                          page: String(current - 1),
                        })}`}
                        className="label border border-line px-4 py-2.5 text-ash transition-colors hover:border-ink hover:text-ink"
                      >
                        ← Newer
                      </Link>
                    )}
                    {current < pageCount && (
                      <Link
                        href={`/admin/subscribers?${new URLSearchParams({
                          ...(active ? { source: active.toLowerCase() } : {}),
                          page: String(current + 1),
                        })}`}
                        className="label border border-line px-4 py-2.5 text-ash transition-colors hover:border-ink hover:text-ink"
                      >
                        Older →
                      </Link>
                    )}
                  </div>
                </div>
              </>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
