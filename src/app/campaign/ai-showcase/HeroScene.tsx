import type { CSSProperties } from 'react'
import { ClaudeMark } from '@/components/tools/marks'
import { ToolMark } from '../_kit/ToolMark'

/**
 * The hero's picture: a person at a laptop, lit by the screen, with the AI
 * tools they will learn floating around them — each joined to the laptop by a
 * beam with light running along it — and a Claude chat drafting above.
 *
 * Drawn, not photographed: one SVG on a 600 × 600 grid, so it is sharp at any
 * size, weighs a few kilobytes and loads with the page. The tool chips are
 * HTML laid over the same grid (positions in %, the grid being square), so the
 * logos are the real marks rather than redrawn ones.
 *
 * To use a real photo instead, put it in /public and pass its path as
 * `photo`: the person is swapped for the image and the tools, beams and chat
 * stay where they are.
 *
 * Decoration with a label: the whole scene is one img role with a description;
 * nothing inside it is focusable. Motion stops under prefers-reduced-motion.
 */

/* Where each tool sits, in the 600 × 600 grid, and the glow it gives off. */
const TOOLS = [
  { name: 'Claude', mark: 'claude', x: 92, y: 288, glow: '#e8875a' },
  { name: 'ChatGPT', mark: 'chatgpt', x: 58, y: 405, glow: '#9ff0d0' },
  { name: 'Cursor', mark: 'cursor', x: 128, y: 535, glow: '#b9b5ff' },
  { name: 'Gemini', mark: 'gemini', x: 505, y: 175, glow: '#7aa8ff' },
  { name: 'n8n', mark: 'n8n', x: 548, y: 340, glow: '#ff7a9a' },
  { name: 'Lovable', mark: 'lovable', x: 486, y: 500, glow: '#ff9ad0' },
] as const

/* The beams start at the laptop's glowing logo. */
const HUB = { x: 300, y: 512 }

const pct = (n: number) => `${(n / 600) * 100}%`

export function HeroScene({ photo }: { photo?: string }) {
  return (
    <div className="vx-scene" role="img" aria-label="A learner at a laptop, with Claude, ChatGPT, Gemini, n8n, Lovable and Cursor glowing around them">
      <svg className="vx-scene-svg" viewBox="0 0 600 600" aria-hidden="true">
        <defs>
          <radialGradient id="vxs-bg" cx="50%" cy="42%" r="70%">
            <stop offset="0" stopColor="#2a2058" />
            <stop offset="0.55" stopColor="#141226" />
            <stop offset="1" stopColor="#0b0b12" />
          </radialGradient>
          <radialGradient id="vxs-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#8b7cff" stopOpacity="0.55" />
            <stop offset="0.6" stopColor="#8b7cff" stopOpacity="0.12" />
            <stop offset="1" stopColor="#8b7cff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vxs-spill" cx="50%" cy="100%" r="80%">
            <stop offset="0" stopColor="#c9c2ff" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="#8b7cff" stopOpacity="0.18" />
            <stop offset="1" stopColor="#8b7cff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="vxs-skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b5764f" />
            <stop offset="1" stopColor="#9a5f3d" />
          </linearGradient>
          <linearGradient id="vxs-skin-lit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b9b0ff" stopOpacity="0" />
            <stop offset="1" stopColor="#b9b0ff" stopOpacity="0.38" />
          </linearGradient>
          <linearGradient id="vxs-hoodie" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a3368" />
            <stop offset="1" stopColor="#1c1838" />
          </linearGradient>
          <linearGradient id="vxs-lid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a4766" />
            <stop offset="0.08" stopColor="#36334f" />
            <stop offset="1" stopColor="#1f1d33" />
          </linearGradient>
          <linearGradient id="vxs-lens" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d7f36b" stopOpacity="0.45" />
            <stop offset="0.5" stopColor="#8b7cff" stopOpacity="0.15" />
            <stop offset="1" stopColor="#8b7cff" stopOpacity="0.35" />
          </linearGradient>
          <filter id="vxs-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id="vxs-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {TOOLS.map((t) => (
            <linearGradient key={t.name} id={`vxs-beam-${t.mark}`} gradientUnits="userSpaceOnUse" x1={HUB.x} y1={HUB.y} x2={t.x} y2={t.y}>
              <stop offset="0" stopColor="#d7f36b" stopOpacity="0.9" />
              <stop offset="1" stopColor={t.glow} stopOpacity="0.9" />
            </linearGradient>
          ))}
        </defs>

        {/* night room */}
        <rect width="600" height="600" fill="url(#vxs-bg)" />
        <g className="vx-scene-grid" stroke="#ffffff" strokeOpacity="0.04">
          {[100, 200, 300, 400, 500].map((v) => (
            <g key={v}>
              <line x1={v} y1="0" x2={v} y2="600" />
              <line x1="0" y1={v} x2="600" y2={v} />
            </g>
          ))}
        </g>
        {/* bokeh — out-of-focus lights behind */}
        <g filter="url(#vxs-blur)" className="vx-scene-bokeh">
          <circle cx="90" cy="110" r="38" fill="#8b7cff" opacity="0.35" />
          <circle cx="520" cy="80" r="30" fill="#d7f36b" opacity="0.22" />
          <circle cx="560" cy="430" r="44" fill="#ff7a9a" opacity="0.18" />
          <circle cx="40" cy="300" r="26" fill="#7aa8ff" opacity="0.25" />
        </g>

        {/* halo behind the head */}
        <circle cx="300" cy="330" r="190" fill="url(#vxs-halo)" />
        <circle className="vx-scene-ring" cx="300" cy="330" r="168" fill="none" stroke="#8b7cff" strokeOpacity="0.35" strokeDasharray="2 10" />
        <circle cx="300" cy="330" r="214" fill="none" stroke="#ffffff" strokeOpacity="0.06" />

        {/* beams: laptop → each tool, with light running along them */}
        <g className="vx-scene-beams">
          {TOOLS.map((t, i) => (
            <g key={t.name}>
              <line x1={HUB.x} y1={HUB.y} x2={t.x} y2={t.y} stroke={`url(#vxs-beam-${t.mark})`} strokeOpacity="0.22" strokeWidth="1.5" />
              <line
                className="vx-scene-flow"
                style={{ animationDelay: `${i * -0.45}s` }}
                x1={HUB.x}
                y1={HUB.y}
                x2={t.x}
                y2={t.y}
                stroke={`url(#vxs-beam-${t.mark})`}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="14 46"
                filter="url(#vxs-glow)"
              />
            </g>
          ))}
        </g>

        {!photo && (
          <g className="vx-scene-person">
            {/* hoodie: shoulders, then the arms reaching down to the keyboard */}
            <path d="M104 600 C106 474 186 412 300 406 C414 412 494 474 496 600 Z" fill="url(#vxs-hoodie)" />
            <path d="M118 600 C122 526 150 476 196 456 L226 474 C200 504 186 548 180 600 Z" fill="#231e45" />
            <path d="M482 600 C478 526 450 476 404 456 L374 474 C400 504 414 548 420 600 Z" fill="#231e45" />
            <path d="M196 456 C176 470 160 496 150 530" stroke="#4a4290" strokeOpacity="0.5" strokeWidth="2" fill="none" />
            <path d="M404 456 C424 470 440 496 450 530" stroke="#4a4290" strokeOpacity="0.5" strokeWidth="2" fill="none" />
            {/* the hood, folded round the neck */}
            <path d="M226 420 C232 392 368 392 374 420 C360 446 240 446 226 420 Z" fill="#2c2659" />
            <path d="M240 420 C252 404 348 404 360 420" stroke="#15122b" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M284 440 L280 470 M316 440 L320 470" stroke="#d7d2ff" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
            {/* neck, with the jaw's shadow on it */}
            <path d="M276 368 L276 414 C290 424 310 424 324 414 L324 368 Z" fill="#8a5333" />
            <path d="M276 376 C290 392 310 392 324 376 L324 388 C310 402 290 402 276 388 Z" fill="#5e3420" opacity="0.45" />
            {/* ears */}
            <ellipse cx="241" cy="318" rx="11" ry="18" fill="#a5653c" />
            <ellipse cx="359" cy="318" rx="11" ry="18" fill="#a5653c" />
            <path d="M238 312 Q243 318 239 326" stroke="#7a4527" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M362 312 Q357 318 361 326" stroke="#7a4527" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* face — a jaw, not an egg — then shading, then the screen's light */}
            <path d="M244 306 C244 258 268 242 300 242 C332 242 356 258 356 306 C356 350 334 384 300 386 C266 384 244 350 244 306 Z" fill="url(#vxs-skin)" />
            <path d="M244 306 C246 344 262 372 284 382 C262 360 254 334 252 306 Z" fill="#7d4728" opacity="0.35" />
            <path d="M356 306 C354 344 338 372 316 382 C338 360 346 334 348 306 Z" fill="#7d4728" opacity="0.35" />
            <path d="M244 306 C244 258 268 242 300 242 C332 242 356 258 356 306 C356 350 334 384 300 386 C266 384 244 350 244 306 Z" fill="url(#vxs-skin-lit)" />
            <ellipse cx="268" cy="346" rx="12" ry="7" fill="#d9846a" opacity="0.22" />
            <ellipse cx="332" cy="346" rx="12" ry="7" fill="#d9846a" opacity="0.22" />
            {/* hair: full, swept up at the front, with a shine */}
            <path d="M236 314 C224 262 244 222 290 214 C326 208 360 222 370 256 C378 282 370 300 364 316 C360 292 352 276 336 268 C316 280 280 282 258 270 C248 282 242 296 240 318 Z" fill="#16100e" />
            <path d="M256 272 C262 238 300 222 336 234 C356 242 366 258 364 276 C354 258 332 250 306 254 C284 256 268 262 256 272 Z" fill="#251a16" />
            <path d="M282 232 C304 222 330 226 346 240" stroke="#5a4436" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M244 300 C246 284 252 274 260 270" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.25" />
            {/* brows */}
            <path d="M261 294 Q275 287 290 292" stroke="#16100e" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M310 292 Q325 287 339 294" stroke="#16100e" strokeWidth="5" fill="none" strokeLinecap="round" />
            {/* eyes, open, looking down at the screen */}
            <path d="M265 318 Q275 312 286 318" stroke="#2b1a12" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M314 318 Q325 312 335 318" stroke="#2b1a12" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <ellipse cx="276" cy="322" rx="5" ry="4.5" fill="#140c08" />
            <ellipse cx="325" cy="322" rx="5" ry="4.5" fill="#140c08" />
            <circle cx="277.5" cy="323.5" r="1.6" fill="#d7f36b" />
            <circle cx="326.5" cy="323.5" r="1.6" fill="#d7f36b" />
            {/* glasses — the screen reflected in the lenses */}
            <rect x="255" y="304" width="40" height="30" rx="10" fill="url(#vxs-lens)" stroke="#100b0a" strokeWidth="3.5" />
            <rect x="305" y="304" width="40" height="30" rx="10" fill="url(#vxs-lens)" stroke="#100b0a" strokeWidth="3.5" />
            <path d="M295 316 Q300 312 305 316" stroke="#100b0a" strokeWidth="3" fill="none" />
            <path d="M255 312 L246 308 M345 312 L354 308" stroke="#100b0a" strokeWidth="3" strokeLinecap="round" />
            <path className="vx-scene-glint" d="M261 310 L272 310" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
            <path className="vx-scene-glint" d="M311 310 L322 310" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
            {/* nose, and a small, focused smile */}
            <path d="M300 330 Q294 346 299 352 Q304 354 308 350" stroke="#6e3f24" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <path d="M287 364 Q300 373 313 364" stroke="#4f2a19" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M292 372 Q300 376 308 372" stroke="#c98a6a" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
          </g>
        )}

        {/* the screen's light spilling up over them */}
        <ellipse className="vx-scene-spill" cx="300" cy="470" rx="230" ry="150" fill="url(#vxs-spill)" />

        {/* laptop, lid towards us, glowing mark */}
        <g className="vx-scene-laptop">
          <path d="M150 600 L150 470 Q150 452 168 452 L432 452 Q450 452 450 470 L450 600 Z" fill="url(#vxs-lid)" />
          <path d="M168 452 L432 452" stroke="#d7f36b" strokeOpacity="0.55" strokeWidth="2" filter="url(#vxs-glow)" />
          <circle cx={HUB.x} cy={HUB.y} r="30" fill="#8b7cff" opacity="0.25" filter="url(#vxs-blur)" />
          <text x={HUB.x} y={HUB.y + 8} textAnchor="middle" className="vx-scene-logo" filter="url(#vxs-glow)">
            skeo
          </text>
        </g>
      </svg>

      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="vx-scene-photo" src={photo} alt="" />
      )}

      {/* Claude, drafting — a glass panel above the scene */}
      <div className="vx-holo" aria-hidden="true">
        <div className="vx-holo-top">
          <ClaudeMark className="vx-holo-mark" />
          <b>Claude</b>
          <i />
        </div>
        <p className="vx-holo-ask">Plan a week of posts for my bakery</p>
        <span className="vx-holo-line" />
        <span className="vx-holo-line" />
        <span className="vx-holo-line vx-holo-short" />
      </div>

      {/* the tools, glowing */}
      {TOOLS.map((t, i) => (
        <span
          key={t.name}
          className="vx-orb"
          aria-hidden="true"
          style={{ left: pct(t.x), top: pct(t.y), '--orb-glow': t.glow, animationDelay: `${i * -0.9}s` } as CSSProperties}
        >
          <ToolMark name={t.name} mark={t.mark} className="vx-orb-mark" id={`orb-${t.mark}`} />
        </span>
      ))}

      <span className="vx-scene-tag" aria-hidden="true">
        <i /> 50+ AI tools inside
      </span>
    </div>
  )
}
