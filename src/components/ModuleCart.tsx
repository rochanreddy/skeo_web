'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics/track'
import { MODULE_ROWS, money, type ModuleKey } from '@/lib/plans'
import { ChatGptMark, ClaudeMark, GeminiMark, LovableMark, N8nMark } from '@/components/tools/marks'
import { useModal } from './modals/ModalProvider'

const MARKS = {
  claude: ClaudeMark,
  chatgpt: ChatGptMark,
  gemini: GeminiMark,
  n8n: N8nMark,
  lovable: LovableMark,
}

/**
 * Step one of buying a tool. Each row owns its own Add button, so there is no
 * separate "add the ticked ones" step between choosing a tool and moving on —
 * the footer holds the running total and Next, and nothing else. The rows
 * already show what is added, so the footer does not count them back.
 *
 * Next does not check out: it opens verification (step two), which is what
 * hands the cart to /checkout (step three). Nothing here talks about money
 * beyond the running total.
 */
export function ModuleCart() {
  const { openVerify } = useModal()
  const [cart, setCart] = useState<ModuleKey[]>([])

  const total = MODULE_ROWS.filter((row) => cart.includes(row.key)).reduce((sum, row) => sum + row.amount, 0)

  function toggle(key: ModuleKey) {
    // Read before the update, and reported outside it: React may call a state
    // updater twice, and a double-counted tick would overstate real interest.
    const removing = cart.includes(key)
    track(removing ? 'module_remove' : 'module_add', { module: key })
    setCart((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]))
  }

  return (
    <div className="module-cart">
      <ul className="module-list">
        {MODULE_ROWS.map((row, i) => {
          const inCart = cart.includes(row.key)
          return (
            <li key={row.key} className={`module-row${inCart ? ' is-added' : ''}`}>
              <span className="module-index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="module-name">
                <b>
                  {row.title}
                  <span className="module-marks" aria-hidden="true">
                    {row.marks.map((mark) => {
                      const Mark = MARKS[mark]
                      return <Mark key={mark} className="module-mark" />
                    })}
                  </span>
                </b>
                <small>{row.subtitle}</small>
              </span>
              <span className="module-price">{row.price}</span>
              <button
                type="button"
                className={`module-add${inCart ? ' is-added' : ''}`}
                onClick={() => toggle(row.key)}
                aria-pressed={inCart}
              >
                {inCart ? 'Added ✓' : 'Add +'}
              </button>
            </li>
          )
        })}
      </ul>

      {/* Kept in the tree while empty: its min-height reserves the row so the
          card does not jump the moment a first tool is added. */}
      <div className="cart-actions">
        {cart.length > 0 && (
          <button
            type="button"
            className="button button-small cart-checkout"
            onClick={() => {
              track('checkout_intent', { modules: cart, amount: total })
              openVerify(cart)
            }}
          >
            <span className="btn-label">Next · {money(total)}</span>
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </div>
  )
}
