import React from 'react'
import '../../css/components/Hero.css'

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <div className="hero-overlay"></div>
      <div className="hero-content container">
        <h1 className="hero-title">Power of IT Solutions</h1>
        <p className="hero-subtitle">
          Transform your business with cutting-edge technology and expert digital solutions.
        </p>
        <a href="#contact" className="btn btn-coral hero-cta">Get Started</a>
      </div>
    </section>
  )
}
