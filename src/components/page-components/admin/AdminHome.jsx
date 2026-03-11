import React from 'react'
import {ResponsiveContainer,LineChart,Line,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend,} from 'recharts'
import '../../../css/components/AdminDashboard.css'

export default function AdminHome() {
  const revenueData = [
    { day: 'Mon', online: 12, offline: 8 },
    { day: 'Tue', online: 18, offline: 10 },
    { day: 'Wed', online: 20, offline: 14 },
    { day: 'Thu', online: 15, offline: 9 },
    { day: 'Fri', online: 22, offline: 16 },
    { day: 'Sat', online: 19, offline: 13 },
    { day: 'Sun', online: 24, offline: 18 },
  ]

  const visitorsData = [
    { month: 'Jan', loyal: 200, news: 120, unique: 150 },
    { month: 'Feb', loyal: 220, news: 140, unique: 160 },
    { month: 'Mar', loyal: 260, news: 150, unique: 190 },
    { month: 'Apr', loyal: 280, news: 180, unique: 210 },
    { month: 'May', loyal: 320, news: 200, unique: 230 },
    { month: 'Jun', loyal: 340, news: 210, unique: 250 },
    { month: 'Jul', loyal: 360, news: 230, unique: 270 },
    { month: 'Aug', loyal: 380, news: 260, unique: 290 },
    { month: 'Sep', loyal: 400, news: 280, unique: 310 },
  ]

  const volumeData = [
    { label: 'Mon', volume: 1100, services: 630 },
    { label: 'Wed', volume: 950, services: 540 },
    { label: 'Fri', volume: 1230, services: 720 },
  ]

  return (
    <>
      <header className="admin-header">
        <h1>Dashboard</h1>
      </header>
      <div className="admin-content admin-home-grid">
        {/* Top summary cards */}
        <section className="admin-home-row admin-home-row--summary">
          <article className="summary-card summary-card--pink">
            <div className="summary-card-label">Total Sales</div>
            <div className="summary-card-value">$1k</div>
            <div className="summary-card-meta">+8% from yesterday</div>
          </article>
          <article className="summary-card summary-card--orange">
            <div className="summary-card-label">Total Orders</div>
            <div className="summary-card-value">300</div>
            <div className="summary-card-meta">+5% from yesterday</div>
          </article>
          <article className="summary-card summary-card--green">
            <div className="summary-card-label">Projects</div>
            <div className="summary-card-value">5</div>
            <div className="summary-card-meta">+12% this week</div>
          </article>
          <article className="summary-card summary-card--blue">
            <div className="summary-card-label">New Users</div>
            <div className="summary-card-value">8</div>
            <div className="summary-card-meta">0.5% from yesterday</div>
          </article>
        </section>

        {/* Middle charts row */}
        <section className="admin-home-row admin-home-row--charts">
          <article className="chart-card">
            <header className="chart-card-header">
              <div>
                <h3>Total Revenue</h3>
                <p>Weekly overview</p>
              </div>
            </header>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="online" name="Online Sales" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="offline" name="Offline Sales" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="chart-card">
            <header className="chart-card-header">
              <div>
                <h3>Visitor Insights</h3>
                <p>Last 9 months</p>
              </div>
            </header>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={visitorsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="loyal" name="Loyal customers" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="news" name="New customers" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="unique" name="Unique customers" stroke="#ec4899" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        {/* Bottom grid: smaller widgets */}
        <section className="admin-home-row admin-home-row--bottom">
          <article className="chart-card">
            <header className="chart-card-header">
              <h3>Top Projects</h3>
            </header>
            <ul className="list-progress">
              <li>
                <span className="list-label">Corporate Website</span>
                <span className="list-value">45%</span>
                <span className="list-bar">
                  <span style={{ width: '45%' }} />
                </span>
              </li>
              <li>
                <span className="list-label">E‑commerce</span>
                <span className="list-value">29%</span>
                <span className="list-bar">
                  <span style={{ width: '29%' }} />
                </span>
              </li>
              <li>
                <span className="list-label">Landing Pages</span>
                <span className="list-value">18%</span>
                <span className="list-bar">
                  <span style={{ width: '18%' }} />
                </span>
              </li>
            </ul>
          </article>

          <article className="chart-card">
            <header className="chart-card-header">
              <h3>Target vs Reality</h3>
            </header>
            <div className="chart-bars chart-bars--single">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => (
                <div key={m} className="chart-bars-item">
                  <span className="chart-bar chart-bar--primary" />
                  <span className="chart-bars-label">{m}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="chart-card">
            <header className="chart-card-header">
              <h3>Volume vs Services</h3>
            </header>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="volume" name="Volume" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="services" name="Services" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>
      </div>
    </>
  )
}
