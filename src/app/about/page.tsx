import type { Metadata } from 'next'
import { About } from '@/components/About'
import { AboutSchema, BreadcrumbSchema } from '@/components/StructuredData'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  path: '/about',
  title: 'About',
  description:
    'skeo teaches every major AI tool as short daily challenges that end in real projects and verified credentials. Built by Menler Learning Systems Private Limited.',
})

export default function AboutPage() {
  return (
    <>
      <About />
      <AboutSchema />
      <BreadcrumbSchema items={[{ name: 'About', path: '/about' }]} />
    </>
  )
}
