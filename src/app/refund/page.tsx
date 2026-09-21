import type { Metadata } from 'next'
import { LegalDoc } from '@/components/LegalDoc'
import { refund } from '@/lib/legal'

export const metadata: Metadata = {
  title: refund.title,
  description: refund.summary,
  alternates: { canonical: '/refund' },
}

export default function Page() {
  return <LegalDoc doc={refund} />
}
