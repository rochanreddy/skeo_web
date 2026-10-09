import type { Metadata } from 'next'
import { LegalDoc } from '@/components/LegalDoc'
import { BreadcrumbSchema } from '@/components/StructuredData'
import { privacy } from '@/lib/legal'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({ path: '/privacy', title: privacy.title, description: privacy.summary })

export default function Page() {
  return (
    <>
      <LegalDoc doc={privacy} />
      <BreadcrumbSchema items={[{ name: privacy.title, path: '/privacy' }]} />
    </>
  )
}
