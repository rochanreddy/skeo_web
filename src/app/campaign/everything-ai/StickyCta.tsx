'use client'

import { useEffect, useState } from 'react'
import { PurchaseButton } from '@/components/ActionButton'
import { useCatalog } from '@/components/CatalogProvider'
import { offerOf } from '@/lib/catalog'
import { inr } from '@/lib/earlyAccess'
import { SeatsLeft } from './Live'

/**
 * The offer, pinned to the bottom of the screen from the moment the hero has
 * scrolled away to the end of the page — so the price, the seats left and the
 * button are never more than a glance off. On the hero itself it stays out of
 * the way: the hero already carries all three.
 */
export function StickyCta() {
  const [show, setShow] = useState(false)
  const catalog = useCatalog()
  const offer = offerOf(catalog)

  useEffect(() => {
    const hero = document.querySelector('.ea-hero-band')
    if (!hero || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { rootMargin: '0px 0px -40% 0px' })
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  return (
    <div className={show ? 'ea-sticky is-shown' : 'ea-sticky'} inert={!show}>
      <div className="ea-sticky-inner">
        <p>
          <span className="ea-sticky-plan">{catalog.campaign.pricing.plan}</span>
          <span className="ea-sticky-price">
            <strong>{inr(offer.price)}</strong>
            <s>{inr(offer.was)}</s>
            <SeatsLeft variant="inline" />
          </span>
        </p>
        <PurchaseButton plan="earlyaccess" className="button button-lime ea-sticky-cta">
          Get Started
        </PurchaseButton>
      </div>
    </div>
  )
}
