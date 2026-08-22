'use client'

import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'
import { ChatGptMark, ClaudeMark, GeminiMark, LovableMark, N8nMark } from '@/components/tools/marks'
import { ChatGptScene, ClaudeScene, GeminiScene, LovableScene, N8nScene } from '@/components/tools/scenes'

/**
 * Hero visual: five tool cards ringed around a panel — exactly two cards wide
 * and tall — that plays a short scene for one tool at a time, five seconds
 * each. The card whose scene is playing is highlighted, so the ring reads as a
 * playlist rather than as decoration.
 */

type Tool = {
  id: string
  name: string
  blurb: string
  tint: string
  mark: (props: { className?: string }) => ReactElement
  scene: () => ReactElement
  rotate: string
  /** Desynchronises the float so the five cards never bob in unison. */
  floatDelay: string
}

const TOOLS: Tool[] = [
  {
    id: 'n8n',
    name: 'n8n',
    blurb: 'Chain tools together',
    tint: '#ea4b71',
    mark: N8nMark,
    scene: N8nScene,
    rotate: '-8deg',
    floatDelay: '0s',
  },
  {
    id: 'claude',
    name: 'Claude',
    blurb: 'Draft, reason, ship',
    tint: '#d97757',
    mark: ClaudeMark,
    scene: ClaudeScene,
    rotate: '6deg',
    floatDelay: '-1.4s',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    blurb: 'Prompts that hold up',
    tint: '#10a37f',
    mark: ChatGptMark,
    scene: ChatGptScene,
    rotate: '-5deg',
    floatDelay: '-2.8s',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    blurb: 'Research at speed',
    tint: '#7d6cf0',
    mark: GeminiMark,
    scene: GeminiScene,
    rotate: '7deg',
    floatDelay: '-4.2s',
  },
  {
    id: 'lovable',
    name: 'Lovable',
    blurb: 'Idea to real app',
    tint: '#ff4f77',
    mark: LovableMark,
    scene: LovableScene,
    rotate: '-6deg',
    floatDelay: '-5.6s',
  },
]

/* Cards sit evenly around a circle, the first one straight up. */
const ANGLE_STEP = 72
const START_ANGLE = -90

/* Each tool holds the panel for five seconds before the next one takes over. */
const CYCLE_MS = 5000

export function ToolStage() {
  const [active, setActive] = useState(0)
  /* Pointer or keyboard focus takes over the cycle — nobody wants the panel
     swapping out from under the card they just reached for. */
  const [held, setHeld] = useState(false)

  useEffect(() => {
    if (held) return
    const timer = window.setInterval(() => setActive((i) => (i + 1) % TOOLS.length), CYCLE_MS)
    return () => window.clearInterval(timer)
  }, [held])

  const tool = TOOLS[active]
  const Scene = tool.scene

  return (
    <div className="tool-stage" style={{ '--tint': tool.tint } as CSSProperties}>
      <div className="stage-panel">
        <div className="panel-glow" aria-hidden="true" />
        {/* Keyed on the tool so every switch restarts the scene from frame one. */}
        <div className="scene" key={tool.id}>
          <Scene />
        </div>
        <div className="panel-caption">
          <strong>{tool.name}</strong>
          <span>{tool.blurb}</span>
        </div>
      </div>

      <div className="stage-orbit" aria-hidden="true" />

      {TOOLS.map((item, index) => {
        const Mark = item.mark
        /* Only the direction is worked out here — the radius stays a CSS custom
           property so it can keep tracking the card size. */
        const angle = ((START_ANGLE + index * ANGLE_STEP) * Math.PI) / 180
        return (
          <button
            key={item.id}
            type="button"
            className={`tool-card${index === active ? ' is-active' : ''}`}
            style={
              {
                '--cx': Math.cos(angle).toFixed(4),
                '--cy': Math.sin(angle).toFixed(4),
                '--rot': item.rotate,
                '--float-delay': item.floatDelay,
                '--tint': item.tint,
              } as CSSProperties
            }
            aria-pressed={index === active}
            onMouseEnter={() => {
              setActive(index)
              setHeld(true)
            }}
            onMouseLeave={() => setHeld(false)}
            onFocus={() => {
              setActive(index)
              setHeld(true)
            }}
            onBlur={() => setHeld(false)}
            onClick={() => setActive(index)}
          >
            <span className="tool-card-face">
              <Mark className="tool-card-mark" />
            </span>
            <span className="sr-only">Preview {item.name}</span>
          </button>
        )
      })}
    </div>
  )
}
