import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RootRedirect() {
  const navigate = useNavigate()
  const { user, loading, isOnboarded } = useAuth()

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      // Not authenticated - go to login
      navigate('/login', { replace: true })
    } else if (!isOnboarded) {
      // Authenticated but not onboarded - go to onboarding
      navigate('/onboarding', { replace: true })
    } else {
      // Authenticated and onboarded - go to dashboard
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, isOnboarded, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to SlideCoffee...</p>
      </div>
    </div>
  )
}

