import type { Metadata } from 'next'
import { LegalDoc } from '@/components/LegalDoc'
import { BreadcrumbSchema } from '@/components/StructuredData'
import { refund } from '@/lib/legal'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({ path: '/refund', title: refund.title, description: refund.summary })

export default function Page() {
  return (
    <>
      <LegalDoc doc={refund} />
      <BreadcrumbSchema items={[{ name: refund.title, path: '/refund' }]} />
    </>
  )
}
