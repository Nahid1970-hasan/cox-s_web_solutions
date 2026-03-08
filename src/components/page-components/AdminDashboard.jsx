import React, { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { API_PATHS } from '../../config/env'
import { coreAxios } from '../../config/axios'
import '../../css/components/AdminDashboard.css'

export default function AdminDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || null)

  useEffect(() => {
    const loadMe = async () => {
      try {
        const { data } = await coreAxios.get(API_PATHS.USER_ME)
        const role = data?.role ?? data?.user?.role ?? null
        if (role) {
          setUserRole(String(role))
          localStorage.setItem('userRole', String(role))
        }
      } catch {
        setUserRole(null)
      }
    }
    loadMe()
  }, [])

  useEffect(() => {
    const canAccessUserSetup = userRole === 'superadmin' || userRole === 'admin'
    if (path.startsWith('/admin/usersetup') && !canAccessUserSetup) {
      navigate('/admin', { replace: true })
    }
  }, [path, userRole, navigate])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRole')
    window.location.href = '/login'
  }

  const showUserSetupModule = userRole === 'superadmin' || userRole === 'admin'

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="admin-logo">Admin</h2>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className={`admin-nav-item ${path === '/admin' ? 'active' : ''}`}>Dashboard</Link>
          {showUserSetupModule && (
            <Link to="/admin/usersetup" className={`admin-nav-item ${path.startsWith('/admin/usersetup') ? 'active' : ''}`}>User Setup</Link>
          )}
          <Link to="/admin/users" className={`admin-nav-item ${path.startsWith('/admin/users') ? 'active' : ''}`}>Users</Link>
          <Link to="/admin" className="admin-nav-item">Projects</Link>
          <Link to="/admin" className="admin-nav-item">Blogs</Link>
          <Link to="/admin" className="admin-nav-item">Contact</Link>
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
