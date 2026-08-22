import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { Audience } from '@/components/sections/Audience'
import { Certification } from '@/components/sections/Certification'
import { Comparison } from '@/components/sections/Comparison'
import { Faq } from '@/components/sections/Faq'
import { FinalCta } from '@/components/sections/FinalCta'
import { Hero } from '@/components/sections/Hero'
import { Jobs } from '@/components/sections/Jobs'
import { LogoStrip } from '@/components/sections/LogoStrip'
import { Pricing } from '@/components/sections/Pricing'
import { Problem } from '@/components/sections/Problem'
import { Projects } from '@/components/sections/Projects'
import { CorePromise } from '@/components/sections/CorePromise'
import { Testimonials } from '@/components/sections/Testimonials'
import { Tools } from '@/components/sections/Tools'

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <LogoStrip />
        <Problem />
        <CorePromise />
        <Tools />
        <Projects />
        <Certification />
        <Jobs />
        <Comparison />
        <Pricing />
        <Audience />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
