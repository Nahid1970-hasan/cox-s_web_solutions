import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { apiUrl, API_PATHS } from '../../config/env'
import '../../css/components/Projects.css'

function mapPublicProject(p) {
  return {
    id: p.project_id ?? p.id,
    title: String(p.project_name ?? ''),
    date: p.date ?? p.created_at ?? p.created_date ?? '',
    details: p.project_details ?? '',
    url: p.project_link ?? '',
    image: p.img_url ?? '',
  }
}

function LinkIcon() {
  return (
    <span className="project-card-link-icon" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </span>
  )
}

export default function Projects() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(apiUrl(API_PATHS.PROJECTS_PUBLIC_LIST), {
          method: 'GET',
          credentials: 'include',
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg = data.message || data.detail || 'Failed to load projects.'
          toast.error(msg)
          setLoading(false)
          return
        }
        const list = Array.isArray(data) ? data : (data.results ?? [])
        setCards((Array.isArray(list) ? list : []).map(mapPublicProject))
      } catch (err) {
        toast.error('Unable to load projects. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section id="projects" className="projects-page">
      <div className="container">
        <div className="projects-hero">
          <span className="projects-watermark" aria-hidden="true">Projects</span>
          <h1 className="projects-title">Our Projects</h1>
          <p className="projects-intro">
            We have successfully contributed to several impactful web applications and digital solutions.
          </p>
        </div>

        <div className="projects-cards">
          {loading && cards.length === 0 && (
            <div className="projects-loading">Loading projects…</div>
          )}
          {!loading && cards.length === 0 && (
            <div className="projects-loading">No projects found.</div>
          )}
          {cards.map((card) => (
            <article key={card.id} className="project-card-simple">
              <div className="project-card-simple-img" >
                {card.image ? (
                  <img src={card.image} alt={card.title} />
                ) : (
                  <div className="project-card-simple-img-placeholder" />
                )}
              </div>
              <div className="project-card-simple-details">
                <h3>
                  {card.url ? (
                    <a href={card.url} target="_blank" rel="noopener noreferrer" className="project-card-title-link">
                      {card.title}
                      <LinkIcon />
                    </a>
                  ) : (
                    card.title
                  )}
                </h3>
                <p>{card.details}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
