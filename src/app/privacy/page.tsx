import type { Metadata } from 'next'
import { LegalDoc } from '@/components/LegalDoc'
import { privacy } from '@/lib/legal'

export const metadata: Metadata = {
  title: privacy.title,
  description: privacy.summary,
  alternates: { canonical: '/privacy' },
}

export default function Page() {
  return <LegalDoc doc={privacy} />
}
