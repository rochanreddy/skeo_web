'use client'

import { useState } from 'react'
import type { CountRow, FunnelStep, SeriesPoint } from '@/lib/analytics/aggregate'

/**
 * The dashboard's three shapes: a trend, a funnel and a ranked list.
 *
 * All hand-drawn — SVG for the trend, flexbox for the other two. A charting
 * library would be the single largest dependency in the project, for three
 * charts whose data is already in exactly the form they need.
 */

const money = (n: number) => `$${n.toLocaleString('en-US')}`

/* ------------------------------------------------------------------ *
 * Trend: visitors as an area, orders as bars underneath it.
 * ------------------------------------------------------------------ */

const W = 900
const H = 260
const PAD = { top: 16, right: 16, bottom: 30, left: 40 }

export function TrendChart({ series, metric }: { series: SeriesPoint[]; metric: 'visitors' | 'revenue' }) {
  const [hover, setHover] = useState<number | null>(null)

  if (series.length === 0) {
    return <p className="admin-empty">Nothing recorded in this window yet.</p>
  }

  const values = series.map((p) => (metric === 'visitors' ? p.visitors : p.revenue))
  const orders = series.map((p) => p.orders)
  // A flat zero series would otherwise divide by zero and collapse the plot.
  const peak = Math.max(1, ...values)
  const orderPeak = Math.max(1, ...orders)

  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  // A single point has no span to divide by; park it in the middle.
  const stepX = series.length > 1 ? plotW / (series.length - 1) : 0
  const x = (i: number) => PAD.left + (series.length > 1 ? i * stepX : plotW / 2)
  const y = (v: number) => PAD.top + plotH - (v / peak) * plotH

  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L${x(values.length - 1).toFixed(1)},${PAD.top + plotH} L${x(0).toFixed(1)},${PAD.top + plotH} Z`

  // Four gridlines is enough to read a value off without becoming a ledger.
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(peak * f))
  const uniqueTicks = [...new Set(ticks)]

  // Roughly six labels, whatever the bucket count, so they never collide.
  const labelEvery = Math.max(1, Math.ceil(series.length / 6))
  const point = hover !== null ? series[hover] : null

  return (
    <div className="chart-wrap">
      <svg
        className="chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${metric === 'visitors' ? 'Visitors' : 'Revenue'} over time`}
        onPointerLeave={() => setHover(null)}
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect()
          // Pointer pixels are in screen space; the plot is in viewBox space.
          const vx = ((event.clientX - box.left) / box.width) * W
          const i = series.length > 1 ? Math.round((vx - PAD.left) / stepX) : 0
          setHover(Math.min(series.length - 1, Math.max(0, i)))
        }}
      >
        <defs>
          <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--purple)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--purple)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {uniqueTicks.map((tick) => (
          <g key={tick}>
            <line className="chart-grid" x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} />
            <text className="chart-axis" x={PAD.left - 8} y={y(tick) + 4} textAnchor="end">
              {metric === 'revenue' ? money(tick) : tick}
            </text>
          </g>
        ))}

        {/* Orders sit behind the line: context for the shape, not the subject. */}
        {orders.map((count, i) =>
          count > 0 ? (
            <rect
              key={i}
              className="chart-bar"
              x={x(i) - Math.min(10, stepX / 3 || 10)}
              width={Math.min(20, (stepX / 3) * 2 || 20)}
              y={PAD.top + plotH - (count / orderPeak) * (plotH * 0.4)}
              height={(count / orderPeak) * (plotH * 0.4)}
              rx="2"
            />
          ) : null,
        )}

        <path className="chart-area" d={area} fill="url(#chart-fill)" />
        <path className="chart-line" d={line} />

        {point && (
          <g>
            <line className="chart-cursor" x1={x(hover!)} x2={x(hover!)} y1={PAD.top} y2={PAD.top + plotH} />
            <circle className="chart-dot" cx={x(hover!)} cy={y(values[hover!])} r="4.5" />
          </g>
        )}

        {series.map((p, i) =>
          i % labelEvery === 0 || i === series.length - 1 ? (
            <text key={p.bucket} className="chart-axis" x={x(i)} y={H - 10} textAnchor="middle">
              {p.label}
            </text>
          ) : null,
        )}
      </svg>

      {point && (
        <div className="chart-tip" role="status">
          <b>{point.label}</b>
          <span>
            {point.visitors} visitor{point.visitors === 1 ? '' : 's'}
          </span>
          <span>{point.pageviews} views</span>
          <span>
            {point.orders} order{point.orders === 1 ? '' : 's'}
          </span>
          <span>{money(point.revenue)}</span>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Funnel: how many of the people above made it to each step.
 * ------------------------------------------------------------------ */

export function Funnel({ steps }: { steps: FunnelStep[] }) {
  const top = steps[0]?.visitors ?? 0

  return (
    <ol className="funnel">
      {steps.map((step, i) => {
        // Widths track the share of the first step, floored so a tiny step is
        // still a visible bar rather than a sliver you cannot read a label off.
        const width = top > 0 ? Math.max(4, (step.visitors / top) * 100) : 4
        const lost = i > 0 ? steps[i - 1].visitors - step.visitors : 0
        return (
          <li key={step.key}>
            <div className="funnel-head">
              <span className="funnel-label">
                <b>{step.label}</b>
                <small>{step.hint}</small>
              </span>
              <span className="funnel-figures">
                <b>{step.visitors.toLocaleString('en-US')}</b>
                <small>{step.overallRate}% of visits</small>
              </span>
            </div>
            <div className="funnel-track">
              <div className="funnel-fill" style={{ width: `${width}%` }} />
            </div>
            {i > 0 && (
              <p className="funnel-drop">
                {step.stepRate}% carried through
                {lost > 0 && (
                  <>
                    {' '}
                    · <span className="funnel-lost">{lost.toLocaleString('en-US')} dropped here</span>
                  </>
                )}
              </p>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/* ------------------------------------------------------------------ *
 * Ranked list: pages, referrers, devices.
 * ------------------------------------------------------------------ */

export function BarList({ rows, empty }: { rows: CountRow[]; empty: string }) {
  if (rows.length === 0) return <p className="admin-empty">{empty}</p>
  const top = Math.max(...rows.map((row) => row.count), 1)

  return (
    <ul className="barlist">
      {rows.map((row) => (
        <li key={row.label}>
          {/* The bar is the row's own background, so the label stays readable
              on top of it rather than being pushed along by it. */}
          <span className="barlist-fill" style={{ width: `${(row.count / top) * 100}%` }} aria-hidden="true" />
          <span className="barlist-label" title={row.label}>
            {row.label}
          </span>
          <span className="barlist-count">
            {row.count.toLocaleString('en-US')}
            <small>{row.share}%</small>
          </span>
        </li>
      ))}
    </ul>
  )
}
