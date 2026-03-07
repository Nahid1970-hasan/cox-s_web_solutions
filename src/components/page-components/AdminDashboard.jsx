import React from 'react'
import { Link } from 'react-router-dom'
import '../../css/components/AdminDashboard.css'

export default function AdminDashboard() {
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    window.location.href = '/login'
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="admin-logo">Admin</h2>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className="admin-nav-item active">Dashboard</Link>
          <Link to="/admin" className="admin-nav-item">Content</Link>
          <Link to="/admin" className="admin-nav-item">Settings</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item">← Back to site</Link>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1>Dashboard</h1>
        </header>
        <div className="admin-content">
          <div className="admin-cards">
            <div className="admin-card">
              <h3>Welcome</h3>
              <p>You are logged in to the admin dashboard.</p>
            </div>
            <div className="admin-card">
              <h3>Quick actions</h3>
              <p>Manage content, projects, and settings from here.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
