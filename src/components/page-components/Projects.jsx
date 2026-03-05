import React from 'react'
import '../../css/components/Projects.css'
import img1 from '../../assets/img/ad.jpg'
import img2 from '../../assets/img/d.jpg'

const cardDetails = 'A modern web application delivering scalable solutions with focus on usability and performance. Built with clean architecture and best practices.'

const cards = [
  { image: img1, title: 'Project 1', details: cardDetails, url: 'https://example.com/project-1' },
  { image: img2, title: 'Project 2', details: cardDetails, url: 'https://example.com/project-2' },
  { image: img1, title: 'Project 3', details: cardDetails, url: 'https://example.com/project-3' },
  { image: img2, title: 'Project 4', details: cardDetails, url: 'https://example.com/project-4' },
  { image: img1, title: 'Project 5', details: cardDetails, url: 'https://example.com/project-5' },
  { image: img2, title: 'Project 6', details: cardDetails, url: 'https://example.com/project-6' },
  { image: img1, title: 'Project 7', details: cardDetails, url: 'https://example.com/project-7' },
  { image: img2, title: 'Project 8', details: cardDetails, url: 'https://example.com/project-8' },
  { image: img1, title: 'Project 9', details: cardDetails, url: 'https://example.com/project-9' },
  { image: img2, title: 'Project 10', details: cardDetails, url: 'https://example.com/project-10' },
]

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
          {cards.map((card, index) => (
            <article key={index} className="project-card-simple">
              <div className="project-card-simple-img" >
                <img src={card.image} alt={card.title} />
              </div>
              <div className="project-card-simple-details">
                <h3>
                  <a href={card.url} target="_blank" rel="noopener noreferrer" className="project-card-title-link">
                    {card.title}
                    <LinkIcon />
                  </a>
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
