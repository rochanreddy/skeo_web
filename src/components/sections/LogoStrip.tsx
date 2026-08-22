import { employers } from '@/lib/content'

export function LogoStrip() {
  return (
    <section className="logo-strip" aria-label="Where Skillora builders end up">
      <div className="wrap">
        <p>Skillora builders go on to teams at</p>
        <div className="logos">
          {employers.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
