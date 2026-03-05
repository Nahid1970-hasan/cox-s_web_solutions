import React from 'react'
import '../../css/components/Footer.css'

const quickLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'Services', href: '#services' },
  { label: 'Blogs', href: '#blogs' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

const services = [
  { label: 'Web Development', href: '#services' },
  { label: 'Cloud Services', href: '#services' },
  { label: 'Digital Marketing', href: '#services' },
  { label: 'IT Consulting', href: '#services' },
]

const social = [
  { label: 'Facebook', href: '#', icon: 'f' },
  { label: 'Twitter', href: '#', icon: '𝕏' },
  { label: 'LinkedIn', href: '#', icon: 'in' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <a href="#hero" className="footer-logo">Cox's Web Solutions</a>
          <p className="footer-desc">
            We deliver powerful IT solutions and digital services to help businesses grow and succeed in the modern world.
          </p>
          <div className="footer-social">
            {social.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} className="social-link">{s.icon}</a>
            ))}
          </div>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            {quickLinks.map((link) => (
              <li key={link.label}><a href={link.href}>{link.label}</a></li>
            ))}
          </ul>
        </div>
        <div className="footer-links">
          <h4>Our Services</h4>
          <ul>
            {services.map((link) => (
              <li key={link.label}><a href={link.href}>{link.label}</a></li>
            ))}
          </ul>
        </div>
        <div className="footer-links">
          <h4>Contact Info</h4>
          <ul>
            <li>+123 456 7890</li>
            <li>hello@coxwebsolutions.com</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© 2026 Cox's Web Solutions. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
