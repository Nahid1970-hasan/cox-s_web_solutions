import React from 'react'
import '../../css/components/PricingSection.css'

const plans = [
  {
    name: 'Basic',
    price: '$100',
    period: '/mo',
    features: ['Up to 5 pages', 'Basic SEO', 'Email support', '1 revision round'],
    cta: 'Choose Plan',
    featured: false,
    icon: '👤',
  },
  {
    name: 'Standard',
    price: '$250',
    period: '/mo',
    features: ['Up to 15 pages', 'Advanced SEO', 'Priority support', '3 revision rounds', 'Analytics setup'],
    cta: 'Choose Plan',
    featured: true,
    icon: '👥',
  },
  {
    name: 'Premium',
    price: '$500',
    period: '/mo',
    features: ['Unlimited pages', 'Full SEO & marketing', 'Dedicated manager', 'Unlimited revisions', 'Custom integrations'],
    cta: 'Choose Plan',
    featured: false,
    icon: '🏢',
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="pricing section">
      <div className="container">
        <div className="section-title">
          <h2>Choose Your Perfect Pricing Plan</h2>
          <p>Flexible options to scale with your business</p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`pricing-card ${plan.featured ? 'pricing-card-featured' : ''}`}
            >
              <div className="pricing-icon">{plan.icon}</div>
              <h3 className="pricing-name">{plan.name}</h3>
              <div className="pricing-price">
                <span className="price-value">{plan.price}</span>
                <span className="price-period">{plan.period}</span>
              </div>
              <ul className="pricing-features">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button type="button" className={`btn ${plan.featured ? 'btn-outline' : 'btn-primary'}`}>
                {plan.cta}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
