'use client'

import { useEffect, useState } from 'react'
import { PurchaseButton } from '@/components/ActionButton'
import { inr, offer } from '@/lib/earlyAccess'

/**
 * The offer, pinned to the bottom of the screen once the hero has scrolled
 * away — so the price and the button are never more than a glance off, and it
 * steps aside again at the closing call to action, which already says it.
 */
export function StickyCta() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const hero = document.querySelector('.ea-hero-band')
    const final = document.querySelector('.ea-final')
    if (!hero || typeof IntersectionObserver === 'undefined') return
    let heroVisible = true
    let finalVisible = false
    const update = () => setShow(!heroVisible && !finalVisible)
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) heroVisible = e.isIntersecting
        if (e.target === final) finalVisible = e.isIntersecting
      }
      update()
    })
    io.observe(hero)
    if (final) io.observe(final)
    return () => io.disconnect()
  }, [])

  return (
    <div className={show ? 'ea-sticky is-shown' : 'ea-sticky'} inert={!show}>
      <div className="ea-sticky-inner">
        <p>
          <span className="ea-sticky-plan">Everything AI · Early Access</span>
          <span className="ea-sticky-price">
            <strong>{inr(offer.price)}</strong>
            <s>{inr(offer.was)}</s>
          </span>
        </p>
        <PurchaseButton plan="earlyaccess" className="button button-lime ea-sticky-cta">
          Get Started
        </PurchaseButton>
      </div>
    </div>
  )
}
