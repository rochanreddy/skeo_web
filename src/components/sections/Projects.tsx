import { ProjectIcon } from '@/components/sections/ProjectIcons'
import { Reveal } from '@/components/Reveal'
import { projects } from '@/lib/content'

export function Projects() {
  return (
    <section className="section projects" id="projects" aria-labelledby="projects-title">
      <div className="wrap project-layout">
        <Reveal className="sticky-copy">
          <span className="eyebrow">THE SKEO SCOPE</span>
          <h2 id="projects-title">
            Don’t just learn AI.
            <br />
            <em>Make it useful.</em>
          </h2>
          <p>
            Learn the tools that matter.
            <br />
            Apply them to real-world problems.
            <br />
            Build real projects and turn your skills into opportunities.
          </p>
          <a href="#pricing" className="button">
            <span className="btn-label">See all tools</span> <span aria-hidden="true">→</span>
          </a>
        </Reveal>
        <div className="project-list">
          {projects.map((project, i) => (
            <Reveal as="article" className="project-item" key={project.title}>
              <div className={`project-art art-${project.art}`} aria-hidden="true">
                <ProjectIcon name={project.icon} />
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
