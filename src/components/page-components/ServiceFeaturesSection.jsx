import React from 'react'
import '../../css/components/ServiceFeaturesSection.css'

const items = [
  {
    number: '01',
    title: 'Software Development',
    description: 'Custom applications and platforms built with modern stacks to solve your unique business challenges.',
    featured: false,
  },
  {
    number: '02',
    title: 'Digital Marketing',
    description: 'Data-driven campaigns and strategies to grow your audience and convert leads into customers.',
    featured: false,
  },
  {
    number: '03',
    title: 'IT Consulting',
    description: 'Strategic guidance and technology roadmaps to align IT with your business objectives.',
    featured: true,
  },
  {
    number: '04',
    title: 'Support & Maintenance',
    description: 'Ongoing monitoring, updates, and support to keep your systems running smoothly.',
    featured: false,
  },
]

export default function ServiceFeaturesSection() {
  return (
    <section id="service-features" className="service-features section">
      <div className="container">
        <div className="section-title">
          <h2>What We Do For Your Business</h2>
          <p>End-to-end services to help you succeed</p>
        </div>
        <div className="service-features-grid">
          {items.map((item) => (
            <article
              key={item.number}
              className={`service-feature-card ${item.featured ? 'service-feature-card-featured' : ''}`}
            >
              <span className="service-feature-number">{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
