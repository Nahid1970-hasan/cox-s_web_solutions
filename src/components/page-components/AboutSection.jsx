import React from 'react'
import '../../css/components/AboutSection.css'

const benefits = [
  'Custom solutions tailored to your business goals',
  'Expert team with years of industry experience',
  'Ongoing support and maintenance',
  'Transparent pricing and clear communication',
]

export default function AboutSection() {
  return (
    <section id="about" className="about section">
      <div className="container about-inner">
        <div className="about-media">
          <div className="about-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80"
            alt="Team collaboration"
          />
        </div>
        <div className="about-content">
          <h2 className="about-title">
            <span className="highlight">Working Together</span> For Your Business
          </h2>
          <p className="about-text">
            We partner with you to understand your challenges and deliver technology solutions that drive real results. Our approach combines strategy, design, and development to create lasting value.
          </p>
          <ul className="about-list">
            {benefits.map((item) => (
              <li key={item}>
                <span className="check">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <a href="#services" className="btn btn-primary">Learn More</a>
        </div>
      </div>
      <div className="about-clients">
        <div className="container">
          <p className="clients-label">Trusted by leading companies</p>
          <div className="clients-logos">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="client-logo">Partner {i}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
