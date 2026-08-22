'use client'

import { useState } from 'react'
import { MODULE_ROWS, money, type ModuleKey } from '@/lib/plans'
import { useModal } from './modals/ModalProvider'

/**
 * Pick any number of modules, add them to the cart in one go, then check out.
 * The cart is deliberately session-only — there is no backend to persist it to,
 * and the checkout modal receives the keys directly.
 */
export function ModuleCart() {
  const { openCart } = useModal()
  const [picked, setPicked] = useState<ModuleKey[]>([])
  const [cart, setCart] = useState<ModuleKey[]>([])

  const rowsInCart = MODULE_ROWS.filter((row) => cart.includes(row.key))
  const total = rowsInCart.reduce((sum, row) => sum + row.amount, 0)

  function toggle(key: ModuleKey) {
    setPicked((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]))
  }

  function addToCart() {
    if (picked.length === 0) return
    setCart((current) => [...current, ...picked.filter((key) => !current.includes(key))])
    setPicked([])
  }

  function remove(key: ModuleKey) {
    setCart((current) => current.filter((k) => k !== key))
  }

  return (
    <div className="module-cart">
      <ul className="module-list">
        {MODULE_ROWS.map((row) => {
          const inCart = cart.includes(row.key)
          return (
            <li key={row.key} className={`module-row${inCart ? ' is-added' : ''}`}>
              <label>
                <input
                  type="checkbox"
                  checked={inCart || picked.includes(row.key)}
                  disabled={inCart}
                  onChange={() => toggle(row.key)}
                />
                <span className="module-box" aria-hidden="true" />
                <span className="module-name">
                  <b>{row.title}</b>
                  <small>{row.subtitle}</small>
                </span>
              </label>
              <span className="module-price">{inCart ? 'In cart' : row.price}</span>
            </li>
          )
        })}
      </ul>

      <div className="cart-actions">
        <button type="button" className="button button-small" onClick={addToCart} disabled={picked.length === 0}>
          <span className="btn-label">Add to cart{picked.length > 0 ? ` · ${picked.length}` : ''}</span>
          <span aria-hidden="true">+</span>
        </button>
        <span className="cart-hint" role="status">
          {picked.length === 0 ? 'Tick any modules to add them' : `${picked.length} selected`}
        </span>
      </div>

      {cart.length > 0 && (
        <div className="cart-tray">
          <ul>
            {rowsInCart.map((row) => (
              <li key={row.key}>
                <b>{row.title}</b>
                <span>{row.price}</span>
                <button type="button" onClick={() => remove(row.key)} aria-label={`Remove ${row.title} from cart`}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <p className="cart-total">
            <span>Total</span>
            <b>{money(total)}</b>
          </p>
          <button type="button" className="button full" onClick={() => openCart(cart)}>
            <span className="btn-label">Checkout · {money(total)}</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  )
}
