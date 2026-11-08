'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

type Tab = { id: string; name: string; logo: string }

/**
 * The tab row above the tool card. Every panel is rendered on the server and
 * only the visible one is shown, so all of the copy is in the page for search
 * and for anyone without JavaScript (the first panel shows by default).
 * Arrow keys move between tabs, as the ARIA tabs pattern expects.
 */
export function ToolSwitcher({ tabs, panels }: { tabs: Tab[]; panels: ReactNode[] }) {
  const [active, setActive] = useState(0)
  const base = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    let next = active
    if (step) next = (active + step + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return
    event.preventDefault()
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <>
      <div className="tool-tabs" role="tablist" aria-label="AI tools" onKeyDown={onKey}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${tab.id}`}
            aria-controls={`${base}-panel-${tab.id}`}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            className="tool-tab"
            onClick={() => setActive(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tab.logo} alt="" width={20} height={20} />
            {tab.name}
          </button>
        ))}
      </div>

      {panels.map((panel, i) => (
        <div
          key={tabs[i].id}
          role="tabpanel"
          id={`${base}-panel-${tabs[i].id}`}
          aria-labelledby={`${base}-tab-${tabs[i].id}`}
          hidden={i !== active}
          className="tool-panel"
        >
          {panel}
        </div>
      ))}
    </>
  )
}
