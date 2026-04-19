import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { apiUrl, mediaUrl, API_PATHS } from '../../config/env'
import '../../css/components/BlogSection.css'

function mapPublicBlog(b) {
  const rawImg = b.image_file ?? b.image_file ?? b.image ?? b.img ?? ''
  const rawDate = b.date ?? b.created_at ?? b.created_date ?? ''
  let dateLabel = ''
  if (rawDate) {
    const d = new Date(rawDate)
    dateLabel = Number.isNaN(d.getTime())
      ? String(rawDate)
      : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  return {
    id: b.blog_id ?? b.id,
    title: String(b.blog_title ?? b.title ?? ''),
    link: b.blog_link ?? b.link ?? '',
    image: mediaUrl(rawImg),
    date: dateLabel,
    category: b.category ?? b.blog_category ?? '',
  }
}

export default function BlogSection() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(apiUrl(API_PATHS.BLOGS_PUBLIC_LIST), {
          method: 'GET',
          credentials: 'include',
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg = data.message || data.detail || 'Failed to load blogs.'
          toast.error(String(msg))
          setLoading(false)
          return
        }
        const list = Array.isArray(data) ? data : (data.results ?? [])
        setPosts((Array.isArray(list) ? list : []).map(mapPublicBlog))
      } catch (err) {
        toast.error('Unable to load blogs. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const visiblePosts = posts.slice(0, 3)

  return (
    <section id="blog" className="blog section">
      <div className="container">
        <div className="section-title">
          <h2>Read Our Latest News</h2>
          <p>Insights and updates from our team</p>
        </div>
        <div className="blog-grid">
          {loading && visiblePosts.length === 0 && (
            <div className="blog-loading">Loading blogs…</div>
          )}
          {!loading && visiblePosts.length === 0 && (
            <div className="blog-loading">No blogs found.</div>
          )}
          {visiblePosts.map((post) => {
            const hasLink = Boolean(post.link)
            const linkProps = hasLink
              ? { href: post.link, target: '_blank', rel: 'noopener noreferrer' }
              : { href: '#', onClick: (e) => e.preventDefault() }
            return (
              <article key={post.id} className="blog-card">
                <a {...linkProps} className="blog-image-link" aria-label={post.title}>
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="blog-card-img-placeholder" />
                  )}
                </a>
                {(post.date || post.category) && (
                  <div className="blog-meta">
                    {post.date && <span className="blog-date">{post.date}</span>}
                    {post.category && <span className="blog-category">{post.category}</span>}
                  </div>
                )}
                <h3 className="blog-title">
                  <a {...linkProps}>{post.title}</a>
                </h3>
                {hasLink && (
                  <a {...linkProps} className="blog-link">Read More →</a>
                )}
              </article>
            )
          })}
        </div>
        <div className="blog-cta-wrap">
          <a href="/blogs" className="btn btn-primary">View All Posts</a>
        </div>
      </div>
    </section>
  )
}
