import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../css/components/Header.css'
import logo from '../../assets/img/navbar.png'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Home', to: '/', isRoute: true },
    { label: 'Services', to: '/#services', isRoute: false },
    { label: 'Blogs', to: '/blogs', isRoute: true },
    { label: 'Projects', to: '/projects', isRoute: true },
    { label: 'Contact', to: '/contact', isRoute: true },
  ]

  return (
    <header className="header">
      <div className="header-inner container">
        <Link to="/" className="logo">
        <img src={logo} alt="Cox's Web Solutions" style={{ width: '220px', height: 'auto' }} />
        </Link>
        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.isRoute ? (
                  <Link to={link.to} onClick={() => setMenuOpen(false)}>{link.label}</Link>
                ) : (
                  <a href={link.to} onClick={() => setMenuOpen(false)}>{link.label}</a>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <Link to="/login" className="header-login btn btn-outline" onClick={() => setMenuOpen(false)}>Login</Link>
        <button
          type="button"
          className="menu-toggle"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  )
}
