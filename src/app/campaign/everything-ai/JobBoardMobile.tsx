'use client'

import { useState } from 'react'
import { TRACKS } from '@/components/sections/JobBoard'
import { ChatGptMark, ClaudeMark, GeminiMark, LovableMark, N8nMark } from '@/components/tools/marks'

/**
 * The Job & Freelancing Board for a phone.
 *
 * The desktop board is a dashboard — three columns, a chart, a ring — and on a
 * 360px screen it shrinks to text nobody can read. This is the same board
 * re-cut for a thumb: the same tracks, counts and roles (TRACKS, shared with
 * the desktop board), laid out as one column. Tabs pick the track, the best
 * match leads, and the next few roles follow.
 */

const MARKS = { claude: ClaudeMark, chatgpt: ChatGptMark, gemini: GeminiMark, n8n: N8nMark, lovable: LovableMark }
const SHOWN = 4

export function JobBoardMobile() {
  const [i, setI] = useState(0)
  const track = TRACKS[i]
  const [best, ...rest] = track.roles
  const shown = rest.slice(0, SHOWN)
  const more = track.roles.length - 1 - shown.length

  return (
    <div className="jbm">
      <div className="jbm-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>skeoai.com/jobs</span>
        <em>Live</em>
      </div>

      <div className="jbm-tabs" role="tablist" aria-label="Opportunity type">
        {TRACKS.map((t, n) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={n === i}
            className={n === i ? 'is-on' : undefined}
            onClick={() => setI(n)}
          >
            {t.label}
            <b>{t.count}</b>
          </button>
        ))}
      </div>

      {/* keyed on the track, so switching replays the entrance */}
      <div className="jbm-body" key={track.key} role="tabpanel">
        <article className="jbm-best">
          <span className="jbm-label">★ Best match</span>
          <h3>{best.title}</h3>
          <p>{best.meta}</p>
          <div className="jbm-meter" aria-label={`${best.match}% match`}>
            <span style={{ width: `${best.match}%` }} />
          </div>
          <b className="jbm-pct">{best.match}% match</b>
        </article>

        <ul className="jbm-roles">
          {shown.map((r) => (
            <li key={r.title}>
              <div>
                <h4>{r.title}</h4>
                <p>{r.meta}</p>
              </div>
              <b>{r.match}%</b>
            </li>
          ))}
        </ul>

        <div className="jbm-foot">
          <span className="jbm-more">+{more} more open roles</span>
          <span className="jbm-skills" aria-label="Tools in demand">
            {track.skills.slice(0, 3).map((s) => {
              const Mark = MARKS[s.mark]
              return (
                <span key={s.label} title={s.label}>
                  {/* Lovable's mark carries its own gradient ids; the desktop
                      board beside this one is display:none on a phone, so
                      sharing its ids would blank the logo here. */}
                  {s.mark === 'lovable' ? (
                    <LovableMark className="jbm-mark" idPrefix="jbm-lovable" />
                  ) : (
                    <Mark className="jbm-mark" />
                  )}
                </span>
              )
            })}
          </span>
        </div>
      </div>
    </div>
  )
}
