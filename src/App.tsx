import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import Editor from './pages/Editor'
import Brands from './pages/Brands'
import Settings from './pages/Settings'
import AdminPanel from './pages/AdminPanel'
import About from './pages/About'
import Careers from './pages/Careers'
import Team from './pages/Team'
import Help from './pages/Help'
import Community from './pages/Community'
import Contact from './pages/Contact'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import CookieNotice from './pages/CookieNotice'
import CookiePreferences from './pages/CookiePreferences'
import Pricing from './pages/Pricing'
import Templates from './pages/Templates'
import Inspiration from './pages/Inspiration'
import Insights from './pages/Insights'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/brands" element={
          <ProtectedRoute>
            <Brands />
          </ProtectedRoute>
        } />
        <Route path="/editor/:id" element={
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        } />
        <Route path="/settings/*" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        } />
        {/* Footer Pages - Product */}
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/inspiration" element={<Inspiration />} />
        <Route path="/insights" element={<Insights />} />
        {/* Footer Pages - Company */}
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/team" element={<Team />} />
        <Route path="/help" element={<Help />} />
        <Route path="/community" element={<Community />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookie-notice" element={<CookieNotice />} />
        <Route path="/cookie-preferences" element={<CookiePreferences />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

