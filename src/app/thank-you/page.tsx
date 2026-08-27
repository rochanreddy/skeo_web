import type { Metadata } from 'next'
import { ThankYou } from '@/components/checkout/ThankYou'

// Reachable only from a paid order, so it has nothing to offer a crawler.
export const metadata: Metadata = {
  title: 'Thank you',
  robots: { index: false, follow: false },
  alternates: { canonical: undefined },
}

export default function ThankYouPage() {
  return <ThankYou />
}
