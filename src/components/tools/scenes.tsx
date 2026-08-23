/**
 * One short looping scene per tool, played inside the stage panel — each one
 * showing what that tool is actually for: a workflow wiring itself up (n8n),
 * code being written (Claude), a conversation (ChatGPT), images and video
 * being generated (Gemini) and a site assembling itself (Lovable).
 *
 * Everything is inline SVG driven by keyframes in globals.css (`.scene-*`), so
 * there is no animation library and reduced-motion visitors land on the final
 * frame of each keyframe rather than on an empty box.
 *
 * Scenes reuse the real brand geometry from `marks` for the badges. Where a
 * shape needs both placement and animation, the placement lives on the shape as
 * an SVG attribute and the animation on a wrapping <g> — a CSS transform on the
 * same node would overwrite the attribute.
 */

import type { CSSProperties } from 'react'
import { CLAUDE_PATH, GEMINI_PATH, LovableMark, OPENAI_PATH } from './marks'

const step = (n: number) => ({ '--step': n }) as CSSProperties

/**
 * n8n: a cropped view of a real n8n canvas — dot grid, a form trigger feeding
 * an AI Agent whose sub-nodes (chat model, memory, two tools) hang below it on
 * dashed links, then an IF node branching true/false into two Slack nodes.
 * The pink highlight runs through the graph the way an execution does.
 */
export function N8nScene() {
  /* Sub-nodes hanging off the agent, each with its own port and label. */
  const subs = [
    { cx: 22, from: 44, glyph: 'anthropic' },
    { cx: 48, from: 54, glyph: 'postgres' },
    { cx: 74, from: 64, glyph: 'entra' },
    { cx: 100, from: 64, glyph: 'jira' },
  ]
  const slack = (cx: number, cy: number) => (
    <g className="slack">
      <rect x={cx - 4.3} y={cy - 5.6} width="2.6" height="6.2" rx="1.3" fill="#36C5F0" />
      <rect x={cx - 0.7} y={cy - 4.3} width="6.2" height="2.6" rx="1.3" fill="#2EB67D" />
      <rect x={cx + 1.7} y={cy - 0.6} width="2.6" height="6.2" rx="1.3" fill="#E01E5A" />
      <rect x={cx - 5.5} y={cy + 1.7} width="6.2" height="2.6" rx="1.3" fill="#ECB22E" />
    </g>
  )
  return (
    <svg viewBox="0 0 120 104" className="scene-art scene-n8n" aria-hidden="true">
      <defs>
        <pattern id="n8n-dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.5" fill="#e9e5f0" />
        </pattern>
        <marker id="n8n-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0 10 5 0 10Z" fill="#b3adbf" />
        </marker>
      </defs>

      {/* No canvas panel — just the grid, so the scene sits on the panel like
          the other four. */}
      <rect x="0" y="0" width="120" height="104" fill="url(#n8n-dots)" />

      {/* Connections along the main row, plus the branch out of the IF node. */}
      <g className="wires">
        <path d="M22 36h8" />
        <path d="M72 36h6" />
        <path d="M96 32c4 0 3-18 8-18" />
        <path d="M96 42c4 0 3 16 8 16" />
      </g>

      {/* Dashed links down to the agent's sub-nodes. */}
      <g className="sub-wires">
        {subs.map((sub) => (
          <path key={sub.cx} d={`M${sub.from} 48C${sub.from} 64 ${sub.cx} 62 ${sub.cx} 76`} />
        ))}
      </g>

      <path className="bolt" d="M6 31 1.5 37h2.7l-.8 4 4.6-5.4H5.3z" />

      {/* Form trigger — rounded off on its left, as n8n draws triggers. */}
      <g className="node" style={{ '--step': 0 } as CSSProperties}>
        <path className="card" d="M13 27h4a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-4a9 9 0 0 1 0-18Z" />
        <g className="glyph doc">
          <rect x="9.5" y="31" width="8" height="10" rx="1.6" />
          <path d="M11.5 34h4M11.5 36.5h4M11.5 39h2.4" />
        </g>
      </g>

      {/* AI Agent — the wide card, with its title and subtitle lines. */}
      <g className="node agent" style={{ '--step': 1 } as CSSProperties}>
        <rect className="card" x="30" y="24" width="42" height="24" rx="5" />
        <g className="glyph robot">
          <rect x="34.5" y="32" width="11" height="9" rx="2.5" />
          <path d="M40 32v-2.5" />
          <circle className="dot" cx="40" cy="28.6" r="1" />
          <circle className="dot" cx="37.4" cy="36.4" r="1.1" />
          <circle className="dot" cx="42.6" cy="36.4" r="1.1" />
        </g>
        <rect className="title" x="49" y="30.5" width="19" height="3.4" rx="1.7" />
        <rect className="subtitle" x="49" y="37" width="13" height="2.6" rx="1.3" />
        <g className="ports">
          <circle cx="44" cy="48" r="1.5" />
          <circle cx="54" cy="48" r="1.5" />
          <circle cx="64" cy="48" r="1.5" />
        </g>
      </g>

      {/* IF node with its true / false outputs. */}
      <g className="node" style={{ '--step': 2 } as CSSProperties}>
        <rect className="card" x="78" y="26" width="18" height="20" rx="5" />
        <g className="glyph signpost">
          <path d="M87 29v14" />
          <path d="M82.5 32.6h7.5l1.8 1.8-1.8 1.8h-7.5z" />
          <path d="M91.5 38.4H84l-1.8 1.8 1.8 1.8h7.5z" />
        </g>
        <g className="ports">
          <circle cx="96" cy="32" r="1.5" />
          <circle cx="96" cy="42" r="1.5" />
        </g>
      </g>

      {/* The two Slack nodes the branch lands on. */}
      <g className="node" style={{ '--step': 3 } as CSSProperties}>
        <rect className="card" x="104" y="6" width="16" height="16" rx="4.5" />
        {slack(112, 14)}
        <rect className="label" x="104" y="25" width="14" height="2.4" rx="1.2" />
      </g>
      <g className="node" style={{ '--step': 3 } as CSSProperties}>
        <rect className="card" x="104" y="50" width="16" height="16" rx="4.5" />
        {slack(112, 58)}
        <rect className="label" x="104" y="69" width="14" height="2.4" rx="1.2" />
      </g>

      {/* Sub-nodes: circular, with a diamond port on top and a label below. */}
      {subs.map((sub, i) => (
        <g key={sub.cx} className="sub-node" style={{ '--step': 4 + i * 0.15 } as CSSProperties}>
          <circle className="card" cx={sub.cx} cy={84} r="8" />
          <path className="port" d={`M${sub.cx} 73.4 ${sub.cx + 2.4} 76l-2.4 2.6L${sub.cx - 2.4} 76Z`} />
          {sub.glyph === 'anthropic' && (
            <path className="glyph anthropic" d={CLAUDE_PATH} transform={`translate(${sub.cx} 84) scale(0.42) translate(-12 -12)`} />
          )}
          {sub.glyph === 'postgres' && (
            <g className="glyph db">
              <ellipse cx={sub.cx} cy="80.6" rx="4.4" ry="1.7" />
              <path d={`M${sub.cx - 4.4} 80.6v6c0 .9 2 1.7 4.4 1.7s4.4-.8 4.4-1.7v-6`} />
            </g>
          )}
          {sub.glyph === 'entra' && (
            <rect className="glyph entra" x={sub.cx - 3.4} y="80.6" width="6.8" height="6.8" rx="1.4" transform={`rotate(45 ${sub.cx} 84)`} />
          )}
          {sub.glyph === 'jira' && (
            <path className="glyph jira" d={`M${sub.cx} 78.4 ${sub.cx + 5.6} 84l-5.6 5.6L${sub.cx - 5.6} 84Z`} />
          )}
          <rect className="label" x={sub.cx - 7} y="95" width="14" height="2.4" rx="1.2" />
        </g>
      ))}
    </svg>
  )
}

/** Claude: code typing itself out, line by line, in an editor window. */
export function ClaudeScene() {
  const lines = [
    { indent: 0, tokens: [14, 24, 9] },
    { indent: 8, tokens: [9, 30] },
    { indent: 8, tokens: [20, 16] },
    { indent: 8, tokens: [11, 26] },
    { indent: 0, tokens: [13] },
  ]
  /* Every third token picks up the keyword colour, which is enough to read as
     syntax highlighting at this size. */
  const tone = (line: number, token: number) => ((line + token) % 3 === 0 ? 'kw' : token % 2 === 0 ? 'fn' : 'str')
  const lastLine = lines[lines.length - 1]
  return (
    <svg viewBox="0 0 120 120" className="scene-art scene-claude" aria-hidden="true">
      <rect className="frame" x="8" y="15" width="104" height="92" rx="9" />
      <g className="chrome">
        <circle cx="19" cy="27" r="2.2" />
        <circle cx="27" cy="27" r="2.2" />
        <circle cx="35" cy="27" r="2.2" />
        <path d="M8 38h104" />
      </g>
      <g className="badge">
        <path d={CLAUDE_PATH} transform="translate(99 27) scale(0.6) translate(-12 -12)" />
      </g>
      {lines.map((line, i) => {
        let x = 18 + line.indent
        return (
          <g key={i} className="code-line" style={step(i)}>
            {line.tokens.map((width, t) => {
              const token = <rect key={t} className={`tok ${tone(i, t)}`} x={x} y={48 + i * 11} width={width} height="5" rx="2.5" />
              x += width + 4
              return token
            })}
          </g>
        )
      })}
      <rect
        className="caret"
        x={18 + lastLine.indent + lastLine.tokens[0] + 4}
        y={48 + (lines.length - 1) * 11 - 1.5}
        width="2.4"
        height="8"
        rx="1.2"
      />
    </svg>
  )
}

/** ChatGPT: a question, a reply being typed, then a follow-up. */
export function ChatGptScene() {
  return (
    <svg viewBox="0 0 120 120" className="scene-art scene-chatgpt" aria-hidden="true">
      <g className="ask-one">
        <rect className="out" x="42" y="14" width="64" height="18" rx="9" />
      </g>
      <g className="reply">
        <circle className="avatar" cx="18" cy="53" r="9" />
        <path className="avatar-mark" d={OPENAI_PATH} transform="translate(18 53) scale(0.46) translate(-12 -12)" />
        <rect className="in" x="32" y="40" width="76" height="27" rx="11" />
        <g className="typing">
          {[0, 1, 2].map((i) => (
            <circle key={i} className="dot" cx={45 + i * 10} cy="53.5" r="3" style={step(i)} />
          ))}
        </g>
        <g className="answer">
          <rect x="42" y="47" width="56" height="4.5" rx="2.25" />
          <rect x="42" y="56" width="38" height="4.5" rx="2.25" />
        </g>
      </g>
      <g className="ask-two">
        <rect className="out" x="54" y="78" width="52" height="17" rx="8.5" />
      </g>
    </svg>
  )
}

/** Gemini: one prompt, two boxes — a still being generated, and a clip. */
export function GeminiScene() {
  /* The mosaic that resolves into the still — a coarse 3x3 that fades out as
     the finished picture fades in underneath it. */
  const mosaic = Array.from({ length: 9 }, (_, i) => ({
    x: 13 + (i % 3) * 14.6,
    y: 45 + Math.floor(i / 3) * 19.6,
    i,
  }))
  return (
    <svg viewBox="0 0 120 120" className="scene-art scene-gemini" aria-hidden="true">
      <defs>
        <linearGradient id="scene-gemini-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4285f4" />
          <stop offset="55%" stopColor="#9b72f2" />
          <stop offset="100%" stopColor="#d96570" />
        </linearGradient>
        <linearGradient id="scene-gemini-scan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="scene-gemini-still">
          <rect x="12" y="44" width="45" height="60" rx="6" />
        </clipPath>
        <clipPath id="scene-gemini-clip">
          <rect x="63" y="44" width="45" height="60" rx="6" />
        </clipPath>
      </defs>

      <g className="prompt">
        <rect className="bar" x="12" y="14" width="96" height="18" rx="9" />
        <path className="spark" d={GEMINI_PATH} transform="translate(23 23) scale(0.42) translate(-12 -12)" />
        <rect className="typed" x="34" y="20.5" width="58" height="5" rx="2.5" />
      </g>

      {/* Left box: a still being generated. */}
      <g className="still" style={step(0)}>
        <g clipPath="url(#scene-gemini-still)">
          <g className="photo">
            <rect x="12" y="44" width="45" height="60" />
            <circle className="sun" cx="44" cy="60" r="5.5" />
            <path className="ridge" d="M12 104V88l11-11 9 9 8-8 17 16v10z" />
          </g>
          {mosaic.map((cell) => (
            <rect key={cell.i} className="cell" x={cell.x} y={cell.y} width="13.6" height="18.6" style={step(cell.i)} />
          ))}
          <rect className="scan" x="12" y="38" width="45" height="12" />
        </g>
        <rect className="edge" x="12" y="44" width="45" height="60" rx="6" />
      </g>

      {/* Right box: a clip being generated — frames land, then it plays. */}
      <g className="clip" style={step(1)}>
        <g clipPath="url(#scene-gemini-clip)">
          <rect className="plate" x="63" y="44" width="45" height="60" />
          <path className="ridge" d="M63 104V86l12-10 10 9 7-7 16 15v11z" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} className="frame" x={68 + i * 9.5} y="50" width="7" height="4.4" rx="1.6" style={step(i)} />
          ))}
        </g>
        <circle className="play-bg" cx="85" cy="72" r="9" />
        <path className="play" d="M82 67.4 89.2 72 82 76.6Z" />
        <rect className="track" x="68" y="95" width="35" height="2.6" rx="1.3" />
        <rect className="fill" x="68" y="95" width="35" height="2.6" rx="1.3" />
        <rect className="edge" x="63" y="44" width="45" height="60" rx="6" />
      </g>
    </svg>
  )
}

/** Lovable: a site building itself, block by block, inside a browser frame. */
export function LovableScene() {
  const blocks = [
    { x: 18, y: 40, w: 84, h: 15, i: 0 },
    { x: 18, y: 59, w: 38, h: 27, i: 1 },
    { x: 60, y: 59, w: 42, h: 12, i: 2 },
    { x: 60, y: 75, w: 42, h: 11, i: 3 },
  ]
  return (
    <svg viewBox="0 0 120 120" className="scene-art scene-lovable" aria-hidden="true">
      <defs>
        <linearGradient id="scene-lovable-cta" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF8E63" />
          <stop offset="100%" stopColor="#FF7EB0" />
        </linearGradient>
      </defs>

      <rect className="frame" x="8" y="14" width="104" height="94" rx="9" />
      <g className="chrome">
        <circle cx="19" cy="26" r="2.2" />
        <circle cx="27" cy="26" r="2.2" />
        <circle cx="35" cy="26" r="2.2" />
        <rect className="url" x="44" y="22" width="58" height="8" rx="4" />
        <path d="M8 36h104" />
      </g>

      {blocks.map((block) => (
        <rect
          key={block.i}
          className="block"
          x={block.x}
          y={block.y}
          width={block.w}
          height={block.h}
          rx="4"
          style={step(block.i)}
        />
      ))}
      <rect className="cta" x="18" y="90" width="34" height="11" rx="5.5" style={step(4)} />

      <g className="logo">
        <LovableMark idPrefix="scene-lovable" x="80" y="82" width="30" height="30" />
      </g>
    </svg>
  )
}
