import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { apiUrl, API_PATHS } from '../../config/env'
import '../../css/components/ContactSection.css'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    try {
      const res = await fetch(apiUrl(API_PATHS.SAVE_CONTACTS), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data.message || data.detail || 'Failed to send message. Please try again.'
        toast.error(String(msg))
        return
      }
      toast.success('Send message successfully.')
      setFormData({ name: '', email: '', message: '' })
    } catch (err) {
      toast.error('Unable to connect. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="contact section contact-page">
      <div className="container">
        <div className="contact-hero">
          <span className="contact-watermark" aria-hidden="true">Contact</span>
          <h1 className="contact-page-title">Our Contact</h1>
        </div>
        <div className="contact-inner">
        <div className="contact-info">
          <h2 className="contact-title">Get In Touch</h2>
          <div className="contact-items">
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <div>
                <strong>Address</strong>
                <p>123 Business Street, Suite 100<br />Your City, ST 12345</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <div>
                <strong>Phone</strong>
                <p>+123 456 7890</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <div>
                <strong>Email</strong>
                <p>hello@coxwebsolutions.com</p>
              </div>
            </div>
          </div>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="contact-name">Name</label>
            <input
              type="text"
              id="contact-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
              disabled={sending}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact-email">Email</label>
            <input
              type="email"
              id="contact-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Your email"
              disabled={sending}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Your message"
              disabled={sending}
            />
          </div>
          <button type="submit" className="btn btn-primary contact-submit" disabled={sending}>
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
        </div>
      </div>
    </section>
  )
}
