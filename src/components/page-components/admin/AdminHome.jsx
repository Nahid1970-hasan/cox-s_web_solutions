import React from 'react'
import '../../../css/components/AdminDashboard.css'

export default function AdminHome() {
  return (
    <>
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
    </>
  )
}
