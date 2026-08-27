import type { Metadata } from 'next'
import { CheckoutClient } from '@/components/checkout/CheckoutClient'

// Reachable only from a verified cart, so it has nothing to offer a crawler.
export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
  alternates: { canonical: undefined },
}

export default function CheckoutPage() {
  return <CheckoutClient />
}
