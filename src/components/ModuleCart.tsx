'use client'

import { useState } from 'react'
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
 * Pick modules one row at a time and go straight to checkout. Each row owns its
 * own Add button, so there is no separate "add the ticked ones" step between
 * choosing a module and paying for it — the footer holds the running total and
 * the Checkout button, and nothing else.
 *
 * The cart is deliberately session-only: there is no backend to persist it to,
 * and the checkout modal receives the keys directly.
 */
export function ModuleCart() {
  const { openCart } = useModal()
  const [cart, setCart] = useState<ModuleKey[]>([])

  const total = MODULE_ROWS.filter((row) => cart.includes(row.key)).reduce((sum, row) => sum + row.amount, 0)

  function toggle(key: ModuleKey) {
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

      <div className="cart-actions">
        {cart.length > 0 ? (
          <>
            <button type="button" className="button button-small cart-checkout" onClick={() => openCart(cart)}>
              <span className="btn-label">Checkout · {money(total)}</span>
              <span aria-hidden="true">→</span>
            </button>
            <span className="cart-hint" role="status">
              {cart.length} module{cart.length > 1 ? 's' : ''} selected
            </span>
          </>
        ) : (
          <span className="cart-hint" role="status">
            Add any module to check out
          </span>
        )}
      </div>
    </div>
  )
}
