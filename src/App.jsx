import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from './components/page-components/Header'
import Hero from './components/page-components/Hero'
import ServicesGrid from './components/page-components/ServicesGrid'
import AboutSection from './components/page-components/AboutSection'
import FeatureSection from './components/page-components/FeatureSection'
import PricingSection from './components/page-components/PricingSection'
import PortfolioSection from './components/page-components/PortfolioSection'
import Projects from './components/page-components/Projects'
import ServiceFeaturesSection from './components/page-components/ServiceFeaturesSection'
import CTABanner from './components/page-components/CTABanner'
import TestimonialsSection from './components/page-components/TestimonialsSection'
import BlogSection from './components/page-components/BlogSection'
import ContactSection from './components/page-components/ContactSection'
import Contact from './components/page-components/Contact'
import Blogs from './components/page-components/Blogs'
import Login from './components/page-components/Login'
import AdminDashboard from './components/page-components/AdminDashboard'
import AdminHome from './components/page-components/admin/AdminHome'
import Users from './components/page-components/admin/Users'
import UserSetup from './components/page-components/admin/UserSetup'
import Footer from './components/page-components/Footer'

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ServicesGrid />
        <AboutSection />
        <FeatureSection />
        <PricingSection />
        <PortfolioSection />
        <ServiceFeaturesSection />
        <CTABanner />
        <TestimonialsSection />
        <BlogSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  )
}

function ProjectsPage() {
  return (
    <>
      <Header />
      <main>
        <Projects />
      </main>
      <Footer />
    </>
  )
}

function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <Contact />
      </main>
      <Footer />
    </>
  )
}

function BlogsPage() {
  return (
    <>
      <Header />
      <main>
        <Blogs />
      </main>
      <Footer />
    </>
  )
}

function LoginPage() {
  return (
    <>
      <Header />
      <main>
        <Login />
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} closeOnClick pauseOnHover theme="light" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminHome />} />
          <Route path="users" element={<UsersPage />} />
        <Route path="usersetup" element={<UserSetupPage />} />
        </Route>
      </Routes>
    </>
  )
}

function UsersPage() {
  return (
    <>
      <header className="admin-header">
        <h1>Users</h1>
      </header>
      <div className="admin-content">
        <Users />
      </div>
    </>
  )
}

function UserSetupPage() {
  return (
    <>
      <header className="admin-header">
        <h1>User Setup</h1>
      </header>
      <div className="admin-content">
        <UserSetup />
      </div>
    </>
  )
}

export default App
