import type { Metadata } from 'next'
import { LegalDoc } from '@/components/LegalDoc'
import { BreadcrumbSchema } from '@/components/StructuredData'
import { terms } from '@/lib/legal'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({ path: '/terms', title: terms.title, description: terms.summary })

export default function Page() {
  return (
    <>
      <LegalDoc doc={terms} />
      <BreadcrumbSchema items={[{ name: terms.title, path: '/terms' }]} />
    </>
  )
}
