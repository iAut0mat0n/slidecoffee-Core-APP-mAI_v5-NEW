import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RootRedirect() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, isOnboarded } = useAuth()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Prevent multiple redirects
    if (loading || hasRedirected) return
    
    // Don't redirect if already on a valid route
    const currentPath = location.pathname
    if (currentPath !== '/' && currentPath !== '/root-redirect') {
      return
    }
    
    if (!user) {
      // Not authenticated - go to login
      navigate('/login', { replace: true })
      setHasRedirected(true)
    } else if (!isOnboarded) {
      // Authenticated but not onboarded - go to onboarding welcome
      navigate('/onboarding/welcome', { replace: true })
      setHasRedirected(true)
    } else {
      // Authenticated and onboarded - go to dashboard
      navigate('/dashboard', { replace: true })
      setHasRedirected(true)
    }
  }, [user, loading, isOnboarded, navigate, location, hasRedirected])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to SlideCoffee...</p>
      </div>
    </div>
  )
}

