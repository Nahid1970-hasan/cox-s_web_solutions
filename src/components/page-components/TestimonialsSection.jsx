import React from 'react'
import '../../css/components/TestimonialsSection.css'
import ahad from '../../assets/img/noor.jpeg';
import arzu from '../../assets/img/arzu.jpeg';
import nahid from '../../assets/img/h.png';

const testimonials = [
  {
    name: 'Ahad Noor',
    role: 'Founder',
    quote: "Cox's Web Solutions delivered exactly what we needed. Their team is professional, responsive, and truly understands business goals.",
    avatar: ahad,
  },
  {
    name: 'Anishur Rahman',
    role: 'CEO',
    quote: "Outstanding work on our platform migration. Clear communication and on-time delivery. We'll definitely work together again.",
    avatar: arzu,
  },
  {
    name: 'Nahid Hasan',
    role: 'Software Engineer',
    quote: "From strategy to execution, they exceeded our expectations. Our digital presence has never been stronger.",
    avatar: nahid,
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
              <div className="testimonial-avatar-wrapper">
                <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
              </div>
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