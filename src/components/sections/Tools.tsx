import { Reveal } from '@/components/Reveal'
import { tools } from '@/lib/content'

export function Tools() {
  return (
    <section className="tools" id="tools" aria-labelledby="tools-title">
      <div className="wrap tools-wrap">
        <Reveal className="tools-copy">
          <span className="eyebrow">YOUR AI TOOL LIBRARY</span>
          <h2 id="tools-title">
            Claude, ChatGPT, Gemini —
            <br />
            and everything between.
          </h2>
          <p>Build fluency across the modern AI stack, without chasing every shiny new release.</p>
        </Reveal>
        <Reveal className="tool-cloud" delay={1}>
          {tools.map((tool) => (
            <span key={tool}>{tool}</span>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
