import type { Metadata } from 'next'
import { LegalDoc } from '@/components/LegalDoc'
import { terms } from '@/lib/legal'

export const metadata: Metadata = {
  title: terms.title,
  description: terms.summary,
  alternates: { canonical: '/terms' },
}

export default function Page() {
  return <LegalDoc doc={terms} />
}
