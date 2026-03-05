import React from 'react'
import '../../css/components/PortfolioSection.css'

const works = [
  { id: 1, title: 'Office & workspace', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80' },
  { id: 2, title: 'Technical tools', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80' },
  { id: 3, title: 'Documentation', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80' },
  { id: 4, title: 'Creative studio', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80' },
]

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="portfolio section">
      <div className="container">
        <div className="section-title">
          <h2>Our Latest Works</h2>
          <p>Projects we're proud of</p>
        </div>
        <div className="portfolio-grid">
          {works.map((work) => (
            <a key={work.id} href="#" className="portfolio-item">
              <img src={work.image} alt={work.title} />
              <div className="portfolio-overlay">
                <span>{work.title}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
