import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { apiUrl, API_PATHS } from '../../config/env'
import '../../css/components/Login.css'

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
      const showUserSetup = role === 'superadmin' || role === 'admin'
      navigate(showUserSetup ? '/admin/usersetup' : '/admin')
    } catch (err) {
      toast.error('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Login</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-username">Username</label>
              <input
                type="text"
                id="login-username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
                autoComplete="username"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
