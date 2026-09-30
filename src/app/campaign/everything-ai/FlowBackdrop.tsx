import { ClaudeMark, N8nMark } from '@/components/tools/marks'

/**
 * An n8n-style workflow drawn faintly behind the job board: rounded node
 * tiles, their ports, and curved wires with data running along them. Two
 * flows, one each side of the heading — "a new lead → AI writes the reply →
 * sent" and "a job posted → matched → you're notified" — so the picture is
 * the thing the section promises: skills put to work.
 *
 * Pure decoration: hidden from screen readers, never clickable. Drawn in
 * white on the dark band at low opacity, so it reads as texture, not content.
 */

type Node = { x: number; y: number; label: string; glyph: 'bolt' | 'claude' | 'if' | 'mail' | 'n8n' | 'bell' | 'sheet' }

const LEFT: Node[] = [
  { x: 20, y: 60, label: 'New lead', glyph: 'bolt' },
  { x: 150, y: 130, label: 'AI Agent', glyph: 'claude' },
  { x: 280, y: 60, label: 'If', glyph: 'if' },
  { x: 280, y: 210, label: 'Gmail', glyph: 'mail' },
]
const LEFT_WIRES: [number, number][] = [[0, 1], [1, 2], [1, 3]]

const RIGHT: Node[] = [
  { x: 20, y: 150, label: 'Job posted', glyph: 'n8n' },
  { x: 150, y: 70, label: 'Match skills', glyph: 'claude' },
  { x: 280, y: 150, label: 'Sheets', glyph: 'sheet' },
  { x: 150, y: 230, label: 'Notify', glyph: 'bell' },
]
const RIGHT_WIRES: [number, number][] = [[0, 1], [1, 2], [0, 3]]

const S = 58 // node size

function Glyph({ kind }: { kind: Node['glyph'] }) {
  switch (kind) {
    case 'claude':
      return <ClaudeMark className="fb-mark" />
    case 'n8n':
      return <N8nMark className="fb-mark" />
    case 'bolt':
      return <path d="M13 3 5 14h6l-1 7 8-11h-6z" />
    case 'if':
      return <path d="M6 4v6a4 4 0 0 0 4 4h8M14 10l4 4-4 4M6 20v-4" />
    case 'mail':
      return <path d="M3 6h18v12H3zM3 7l9 6 9-6" />
    case 'sheet':
      return <path d="M4 4h16v16H4zM4 10h16M4 15h16M10 4v16" />
    case 'bell':
      return <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4" />
  }
}

function Flow({ nodes, wires, className }: { nodes: Node[]; wires: [number, number][]; className: string }) {
  return (
    <svg className={`fb-flow ${className}`} viewBox="0 0 360 300" aria-hidden="true">
      {wires.map(([a, b]) => {
        const from = nodes[a]
        const to = nodes[b]
        const x1 = from.x + S
        const y1 = from.y + S / 2
        const x2 = to.x
        const y2 = to.y + S / 2
        const mid = (x1 + x2) / 2
        const d = `M${x1} ${y1} C${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`
        return (
          <g key={`${a}-${b}`}>
            <path className="fb-wire" d={d} />
            <path className="fb-data" d={d} />
            <circle className="fb-port" cx={x1} cy={y1} r="3.5" />
            <circle className="fb-port" cx={x2} cy={y2} r="3.5" />
          </g>
        )
      })}
      {nodes.map((n) => (
        <g key={n.label} transform={`translate(${n.x} ${n.y})`}>
          <rect className="fb-node" width={S} height={S} rx="12" />
          <g className="fb-glyph" transform={`translate(${S / 2 - 12} ${S / 2 - 12})`}>
            {n.glyph === 'claude' || n.glyph === 'n8n' ? (
              // brand marks keep their own fill; no stroke to inherit
              <svg width="24" height="24" viewBox="0 0 24 24">
                <Glyph kind={n.glyph} />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <Glyph kind={n.glyph} />
              </svg>
            )}
          </g>
          <text className="fb-label" x={S / 2} y={S + 16} textAnchor="middle">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function FlowBackdrop() {
  return (
    <div className="fb" aria-hidden="true">
      <Flow nodes={LEFT} wires={LEFT_WIRES} className="fb-left" />
      <Flow nodes={RIGHT} wires={RIGHT_WIRES} className="fb-right" />
    </div>
  )
}
