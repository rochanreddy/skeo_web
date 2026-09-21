import type { Metadata } from 'next'
import { About } from '@/components/About'

export const metadata: Metadata = {
  title: 'About',
  description:
    'skeo teaches every major AI tool as short daily challenges that end in real projects and verified credentials. Built by Menler Learning Systems Private Limited.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return <About />
}
