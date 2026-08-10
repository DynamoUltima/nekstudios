/**
 * Daily revenue, one series.
 *
 * One series means no legend — the panel title says what is plotted. Bars are
 * ink; the day still in progress is red so a half-height last column can't be
 * misread as a collapse. Hover is CSS only, so this stays a server component.
 */

import { fmtDate, fmtMoney, fmtWeekday } from "@/lib/admin/format";
import type { DayPoint } from "@/lib/admin/metrics";

const W = 760;
const H = 240;
const PAD = { top: 22, right: 8, bottom: 30, left: 52 };

const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

/** Round a ceiling up to something a human would write on an axis. */
function niceMax(value: number) {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / (magnitude / 2)) * (magnitude / 2);
}

/** Square at the baseline, 4px rounded at the data end. */
function barPath(x: number, y: number, w: number, h: number, r = 4) {
  const rr = Math.max(0, Math.min(r, w / 2, h));
  return [
    `M${x},${y + h}`,
    `L${x},${y + rr}`,
    `Q${x},${y} ${x + rr},${y}`,
    `L${x + w - rr},${y}`,
    `Q${x + w},${y} ${x + w},${y + rr}`,
    `L${x + w},${y + h}`,
    "Z",
  ].join(" ");
}

export function RevenueChart({ data }: { data: DayPoint[] }) {
  if (data.length === 0) return null;

  const max = niceMax(Math.max(...data.map((d) => d.revenue)));
  const ticks = [0, max / 2, max];

  const band = PLOT_W / data.length;
  // 2px of surface between neighbours, and never a slab wider than 24.
  const barW = Math.min(24, band - 2);

  const peakIndex = data.reduce(
    (best, d, i) => (d.revenue > data[best].revenue ? i : best),
    0,
  );
  const lastIndex = data.length - 1;

  const y = (value: number) => PAD.top + PLOT_H - (value / max) * PLOT_H;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Daily revenue for the last ${data.length} days. Peak ${fmtMoney(
          data[peakIndex].revenue,
        )} on ${fmtDate(data[peakIndex].date)}.`}
      >
        {/* Gridlines: solid hairlines, one step off the surface. */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--color-line)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 12}
              y={y(tick) + 4}
              textAnchor="end"
              className="fill-ash font-mono text-[11px] tabular-nums"
            >
              {tick === 0 ? "0" : fmtMoney(tick)}
            </text>
          </g>
        ))}

        {data.map((point, i) => {
          const x = PAD.left + i * band + (band - barW) / 2;
          const height = Math.max(point.revenue === 0 ? 0 : 2, (point.revenue / max) * PLOT_H);
          const top = PAD.top + PLOT_H - height;
          const today = i === lastIndex;
          const tipAnchor = i > data.length - 4 ? "end" : "start";
          const tipX = tipAnchor === "end" ? x + barW : x;

          return (
            <g key={point.date.toISOString()} className="group">
              {/* Hit target is the whole column, not the bar. */}
              <rect
                x={PAD.left + i * band}
                y={PAD.top}
                width={band}
                height={PLOT_H}
                fill="transparent"
              />
              <path
                d={barPath(x, top, barW, height)}
                className={today ? "fill-red" : "fill-ink"}
                opacity={today ? 1 : 0.88}
              />

              {/* Only the peak carries a printed value. */}
              {i === peakIndex && (
                <text
                  x={x + barW / 2}
                  y={top - 8}
                  textAnchor="middle"
                  className="fill-ink font-mono text-[11px] tabular-nums"
                >
                  {fmtMoney(point.revenue)}
                </text>
              )}

              {/* Every seventh day gets a tick label so the axis stays readable. */}
              {(i % 7 === 0 || today) && (
                <text
                  x={x + barW / 2}
                  y={H - 10}
                  textAnchor="middle"
                  className="fill-ash font-mono text-[10px]"
                >
                  {today ? "TODAY" : fmtDate(point.date)}
                </text>
              )}

              <g className="pointer-events-none opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                <rect
                  x={tipAnchor === "end" ? tipX - 132 : tipX}
                  y={Math.max(2, top - 46)}
                  width="132"
                  height="38"
                  className="fill-ink"
                />
                <text
                  x={tipAnchor === "end" ? tipX - 122 : tipX + 10}
                  y={Math.max(2, top - 46) + 15}
                  className="fill-bone font-mono text-[10px] tracking-[0.14em]"
                >
                  {fmtWeekday(point.date).toUpperCase()} {fmtDate(point.date)}
                </text>
                <text
                  x={tipAnchor === "end" ? tipX - 122 : tipX + 10}
                  y={Math.max(2, top - 46) + 30}
                  className="fill-bone font-mono text-[11px] tabular-nums"
                >
                  {fmtMoney(point.revenue)} · {point.orders} orders
                </text>
              </g>
            </g>
          );
        })}

        {/* Baseline sits above the grid so bars land on a solid rule. */}
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={PAD.top + PLOT_H}
          y2={PAD.top + PLOT_H}
          stroke="var(--color-ink)"
          strokeWidth="1"
        />
      </svg>

      <details className="mt-4 border-t border-line pt-4">
        <summary className="label cursor-pointer text-ash transition-colors hover:text-ink">
          Show as table
        </summary>
        <div className="mt-4 max-h-64 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th scope="col" className="label py-2 font-medium text-ash">Day</th>
                <th scope="col" className="label py-2 text-right font-medium text-ash">
                  Revenue
                </th>
                <th scope="col" className="label py-2 text-right font-medium text-ash">
                  Orders
                </th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((point) => (
                <tr key={point.date.toISOString()} className="border-t border-line">
                  <td className="py-2">
                    {fmtWeekday(point.date)} {fmtDate(point.date)}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {fmtMoney(point.revenue)}
                  </td>
                  <td className="py-2 text-right tabular-nums">{point.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
