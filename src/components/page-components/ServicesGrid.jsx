import React from 'react'
import '../../css/components/ServicesGrid.css'

const services = [
  {
    icon: '🖥️',
    title: 'Web Development',
    description: 'Custom websites and web applications built with modern technologies for speed and scalability.',
    href: '#',
  },
  {
    icon: '⚙️',
    title: 'Cloud Services',
    description: 'Secure cloud infrastructure, migration, and management to scale your operations.',
    href: '#',
  },
  {
    icon: '📄',
    title: 'Digital Documents',
    description: 'Streamlined document workflows and digital transformation for your business.',
    href: '#',
  },
  {
    icon: '☁️',
    title: 'Cloud Solutions',
    description: 'End-to-end cloud strategy, deployment, and optimization for your needs.',
    href: '#',
  },
  {
    icon: '🗄️',
    title: 'Database Management',
    description: 'Design, optimization, and maintenance of robust database systems.',
    href: '#',
  },
  {
    icon: '📊',
    title: 'Analytics & Funnel',
    description: 'Data-driven insights and conversion funnel optimization for growth.',
    href: '#',
  },
  {
    icon: '✏️',
    title: 'Content Strategy',
    description: 'Strategic content planning and creation that resonates with your audience.',
    href: '#',
  },
  {
    icon: '📦',
    title: 'Integration & API',
    description: 'Seamless integrations and API development to connect your tools.',
    href: '#',
  },
]

export default function ServicesGrid() {
  return (
    <section id="services" className="services section">
      <div className="container">
        <div className="section-title">
          <h2>Exceptional Services</h2>
          <p>Everything you need to grow your business digitally</p>
        </div>
        <div className="services-grid">
          {services.map((service) => (
            <article key={service.title} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <a href={service.href} className="service-link">Read More →</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
