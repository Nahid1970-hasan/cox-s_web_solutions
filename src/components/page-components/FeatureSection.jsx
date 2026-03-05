import React from 'react'
import '../../css/components/FeatureSection.css'
import img from '../../assets/img/g.png';

const features = [
  'Strategic planning and technology consulting',
  'Agile development and rapid delivery',
  'Security-first approach to all projects',
  'Dedicated account management and support',
]

const stats = [
  { value: '5k+', label: 'Projects Completed' },
  { value: '20+', label: 'Years in Business' },
  { value: '100', label: 'Team Members' },
  { value: '99%', label: 'Client Satisfaction' },
]

export default function FeatureSection() {
  return (
    <section id="feature" className="feature section">
      <div className="container feature-inner">
        <div className="feature-content">
          <h2 className="feature-title">
            <span className="highlight">We Ensure</span> Your Success
          </h2>
          <p className="feature-text">
            Our proven methodology and deep expertise help you avoid pitfalls and achieve your goals faster. We focus on outcomes, not just deliverables.
          </p>
          <ul className="feature-list">
            {features.map((item) => (
              <li key={item}>
                <span className="check">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="feature-media">
          <div className="feature-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
          </div>
          <img
            src={img}
            style={{ width: '100%', height: '600px', objectFit: 'cover' }}
            alt="Consulting professional"
          />
        </div>
      </div>
      <div className="feature-stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="stat-icon">📊</div>
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
