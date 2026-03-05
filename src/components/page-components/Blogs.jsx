import React from 'react'
import '../../css/components/BlogSection.css'

const posts = [
  {
    id: 1,
    title: 'How to Choose the Right Tech Stack in 2026',
    date: 'March 2026',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80',
  },
  {
    id: 2,
    title: 'Digital Transformation: A Step-by-Step Guide',
    date: 'February 2026',
    category: 'Business',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
  },
  {
    id: 3,
    title: 'Why Your Business Needs a Modern Website',
    date: 'January 2026',
    category: 'Web',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
  },
]

export default function Blogs() {
  return (
    <section id="blog" className="blog section blogs-page">
      <div className="container">
        <div className="blogs-hero">
          <span className="blogs-watermark" aria-hidden="true">Blogs</span>
          <h1 className="contact-page-title">Blogs</h1>
          <p className="blogs-page-title">Read Our Latest News</p>
          <p className="blogs-page-subtitle">Insights and updates from our team</p>
        </div>
        <div className="blog-grid">
          {posts.map((post) => (
            <article key={post.id} className="blog-card">
              <a href="#" className="blog-image-link">
                <img src={post.image} alt={post.title} />
              </a>
              <div className="blog-meta">
                <span className="blog-date">{post.date}</span>
                <span className="blog-category">{post.category}</span>
              </div>
              <h3 className="blog-title">
                <a href="#">{post.title}</a>
              </h3>
              <a href="#" className="blog-link">Read More →</a>
            </article>
          ))}
        </div>
        <div className="blog-cta-wrap">
          <a href="#" className="btn btn-primary">View All Posts</a>
        </div>
      </div>
    </section>
  )
}
