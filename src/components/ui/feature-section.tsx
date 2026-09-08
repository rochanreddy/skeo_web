import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react'
import { Reveal } from '@/components/Reveal'
import { cn } from '@/lib/utils'

export type FeatureItem = {
  text: string
  /** Turns the line into a link — used to point at the section that proves it. */
  href?: string
}

export type FeatureCategory = {
  icon: ReactNode
  title: string
  items: FeatureItem[]
}

export type FeatureGridProps = Omit<ComponentPropsWithoutRef<'section'>, 'title'> & {
  title: ReactNode
  subtitle: string
  /** Small uppercase label above the heading, matching the other sections. */
  eyebrow?: string
  /** Set when the section is referenced by aria-labelledby. */
  titleId?: string
  /** Optional figure beside the heading. Without one the heading centres. */
  illustrationSrc?: string
  illustrationAlt?: string
  categories: FeatureCategory[]
  buttonText: string
  buttonHref: string
  ref?: Ref<HTMLElement>
}

/**
 * A grid of categories, each one an icon, a heading and a short list of what
 * it covers, sitting inside a single panel under a heading.
 *
 * The layout is the one from the source component; the styling is not. Every
 * colour here comes from the page's own tokens rather than from utilities, so
 * the section retints with the palette switcher like everything else, and the
 * entrance rides `Reveal` — the IntersectionObserver the rest of the page
 * already uses — instead of pulling in a second animation runtime.
 */
export function FeatureGrid({
  title,
  subtitle,
  eyebrow,
  titleId,
  illustrationSrc,
  illustrationAlt = '',
  categories,
  buttonText,
  buttonHref,
  className,
  ref,
  ...props
}: FeatureGridProps) {
  return (
    <section ref={ref} className={cn('section feature-grid', className)} {...props}>
      <div className="wrap">
        <Reveal className={cn('center-heading fg-head', illustrationSrc && 'fg-head-split')}>
          <div className="fg-intro">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2 id={titleId}>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {illustrationSrc && (
            /* eslint-disable-next-line @next/next/no-img-element -- callers pass
               arbitrary remote art, which next/image would need configuring for. */
            <img className="fg-illustration" src={illustrationSrc} alt={illustrationAlt} />
          )}
        </Reveal>

        <Reveal className="fg-panel" delay={1}>
          <div className="fg-categories reveal-stagger">
            {categories.map((category) => (
              <div className="fg-category" key={category.title}>
                <span className="fg-icon" aria-hidden="true">
                  {category.icon}
                </span>
                <h3>{category.title}</h3>
                <ul>
                  {category.items.map((item) => (
                    <li key={item.text}>
                      {item.href ? <a href={item.href}>{item.text}</a> : item.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <a className="button fg-cta" href={buttonHref}>
            <span className="btn-label">{buttonText}</span>
            <span aria-hidden="true">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
