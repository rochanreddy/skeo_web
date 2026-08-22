import { Reveal } from '@/components/Reveal'
import { projects } from '@/lib/content'

export function Projects() {
  return (
    <section className="section projects" id="projects" aria-labelledby="projects-title">
      <div className="wrap project-layout">
        <Reveal className="sticky-copy">
          <span className="eyebrow">LEARN BY BUILDING</span>
          <h2 id="projects-title">
            Don’t just learn AI.
            <br />
            <em>Make it useful.</em>
          </h2>
          <p>
            Every module is packed with portfolio-worthy work. No pretend exercises, no empty certificates.
          </p>
          <a href="#pricing" className="button button-outline">
            <span className="btn-label">See all modules</span> <span aria-hidden="true">→</span>
          </a>
        </Reveal>
        <div className="project-list">
          {projects.map((project, i) => (
            <Reveal as="article" className="project-item" key={project.title}>
              <div className={`project-art art-${project.art}`} aria-hidden="true">
                <span>{project.glyph}</span>
              </div>
              <div>
                <small>{project.category}</small>
                <h3>{project.title}</h3>
                <p>{project.body}</p>
              </div>
              <b aria-hidden="true">{String(i + 1).padStart(2, '0')}</b>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
