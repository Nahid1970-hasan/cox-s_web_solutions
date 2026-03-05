import React from 'react'
import '../../css/components/CTABanner.css'

export default function CTABanner() {
  return (
    <section className="cta-banner">
      <div className="cta-banner-bg"></div>
      <div className="cta-banner-overlay"></div>
      <div className="container cta-banner-inner">
        <div className="cta-banner-content">
          <h2 className="cta-banner-title">
            We Create <span className="highlight">Intelligent</span> Products
          </h2>
          <a href="tel:+1234567890" className="cta-phone">
            <span className="cta-phone-icon">📞</span>
            +123 456 7890
          </a>
        </div>
        <a href="#contact" className="btn btn-primary cta-banner-btn">Get a Quote</a>
      </div>
    </section>
  )
}
