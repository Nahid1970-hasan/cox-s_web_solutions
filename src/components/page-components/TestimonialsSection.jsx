import React from 'react'
import '../../css/components/TestimonialsSection.css'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CEO, TechStart Inc.',
    quote: 'Cox\'s Web Solutions delivered exactly what we needed. Their team is professional, responsive, and truly understands business goals.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=80',
  },
  {
    name: 'Michael Chen',
    role: 'CTO, DataFlow',
    quote: 'Outstanding work on our platform migration. Clear communication and on-time delivery. We\'ll definitely work together again.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&q=80',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Marketing Director, GrowthCo',
    quote: 'From strategy to execution, they exceeded our expectations. Our digital presence has never been stronger.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80',
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="testimonials section">
      <div className="container">
        <div className="section-title">
          <h2>What Our Customers Say</h2>
          <p>Real feedback from businesses we've helped</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <article key={t.name} className="testimonial-card">
              <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
              <h3 className="testimonial-name">{t.name}</h3>
              <p className="testimonial-role">{t.role}</p>
              <blockquote className="testimonial-quote">"{t.quote}"</blockquote>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
