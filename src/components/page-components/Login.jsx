import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { apiUrl, API_PATHS } from '../../config/env'
import '../../css/components/Login.css'
import logo from '../../assets/img/logo.jpeg'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(apiUrl(API_PATHS.LOGIN), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          role: 'admin',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data.message || data.detail || 'Login failed. Please check your credentials.'
        toast.error(msg)
        setLoading(false)
        return
      }
      if (data.token) {
        localStorage.setItem('authToken', data.token)
      }
      if (data.access) {
        localStorage.setItem('authToken', data.access)
      }
      const role = (data.user?.role ?? data.role) ? String(data.user?.role ?? data.role).toLowerCase() : 'admin'
      localStorage.setItem('userRole', role)
      toast.success('Login successful.')
      navigate('/admin')
    } catch (err) {
      toast.error('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const PersonIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="login-input-icon"
    >
      <path d="M18 20a6 6 0 0 0-12 0" />
      <circle cx="12" cy="10" r="4" />
    </svg>
  );
  

  const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="login-input-icon">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )

  return (
    <section className="login-page">
      <div className="login-card">
        <div className="login-layout">
          {/* Left: Illustration */}
          <div className="login-illustration">
            <div className="login-shape login-shape--circle-top-left" />
            <div className="login-shape login-shape--triangle-mid-left" />
            <div className="login-shape login-shape--square-top" />
            <div className="login-shape login-shape--triangle-top-right" />
            <div className="login-shape login-shape--circle-bottom-right" />
            <div className="login-shape login-shape--triangle-bottom-left" />
            <div className="login-illustration-center">
              <img src={logo} alt="Cox Web Solutions logo" className="login-illustration-logo" />
            </div>
          </div>

        {/* Right: Form */}
        <div className="login-form-section">
          <h1 className="login-title">Member Login</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-group">
              <span className="login-input-wrap">
                <PersonIcon />
                <input
                  type="text"
                  id="login-username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Username"
                  autoComplete="username"
                  disabled={loading}
                  className="login-input"
                />
              </span>
            </div>
            <div className="login-form-group">
              <span className="login-input-wrap">
                <LockIcon />
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="login-input"
                />
              </span>
            </div>
            <button type="submit" className="login-btn-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>
          <p className="login-forgot">
            <a href="#" className="login-link" onClick={(e) => e.preventDefault()}>Forgot Username / Password?</a>
          </p>
          {/* <p className="login-create">
            <Link to="/register" className="login-link login-link--create">Create your Account →</Link>
          </p> */}
        </div>
        </div>
      </div>
    </section>
  )
}
