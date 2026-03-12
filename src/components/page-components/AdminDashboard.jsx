import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import '../../css/components/AdminDashboard.css'

export default function AdminDashboard() {
  const location = useLocation()
  const path = location.pathname

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRole')
    window.location.href = '/login'
  }


  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="admin-logo">Admin</h2>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className={`admin-nav-item ${path === '/admin' ? 'active' : ''}`}>Dashboard</Link>
          <Link to="/admin/usersetup" className={`admin-nav-item ${path.startsWith('/admin/usersetup') ? 'active' : ''}`}>User Dashboard</Link>
          <Link to="/admin/users" className={`admin-nav-item ${path.startsWith('/admin/users') && !path.startsWith('/admin/usersetup') ? 'active' : ''}`}>Users</Link>
          <Link to="/admin/projects" className={`admin-nav-item ${path.startsWith('/admin/projects') ? 'active' : ''}`}>Projects</Link>
          <Link to="/admin/blogs" className={`admin-nav-item ${path.startsWith('/admin/blogs') ? 'active' : ''}`}>Blogs</Link>
          <Link to="/admin/clientinfo" className={`admin-nav-item ${path.startsWith('/admin/clientinfo') ? 'active' : ''}`}>Client Info</Link>
          <Link to="/admin/billinginvoice" className={`admin-nav-item ${path.startsWith('/admin/billinginvoice') ? 'active' : ''}`}>Billing Invoice</Link>
          <Link to="/admin/contact" className={`admin-nav-item ${path.startsWith('/admin/contact') ? 'active' : ''}`}>Contact</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <button type="button" className="admin-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
