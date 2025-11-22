import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import PresentationSlideshow from '../components/PresentationSlideshow'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'

interface PresentationData {
  id: string
  title: string
  description: string
  slides: any[]
  shareSettings: any
}

export default function PresentView() {
  const { shareToken } = useParams<{ shareToken: string }>()
  const navigate = useNavigate()
  const [presentation, setPresentation] = useState<PresentationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requiresPassword, setRequiresPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadPresentation = async () => {
    try {
      setLoading(true)
      setPasswordError(null)
      
      const response = await fetch(`/api/present/${shareToken}`)
      const data = await response.json()

      if (!response.ok) {
        if (data.requiresPassword) {
          setRequiresPassword(true)
          setLoading(false)
          return
        }
        throw new Error(data.error || 'Failed to load presentation')
      }

      setPresentation(data)
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (shareToken) {
      loadPresentation()
    }
  }, [shareToken])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim()) {
      setPasswordError('Password is required')
      return
    }

    try {
      setSubmitting(true)
      setPasswordError(null)

      const response = await fetch(`/api/present/${shareToken}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Incorrect password')
      }

      setPresentation(data)
      setRequiresPassword(false)
    } catch (err: any) {
      setPasswordError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading presentation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Presentation Not Available</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/')}>
            Go to Homepage
          </Button>
        </Card>
      </div>
    )
  }

  if (requiresPassword && !presentation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Protected</h1>
            <p className="text-gray-600">This presentation requires a password to view</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError(null)
                }}
                placeholder="Enter password"
                className={passwordError ? 'border-red-500' : ''}
                autoFocus
                disabled={submitting}
              />
              {passwordError && (
                <p className="text-sm text-red-600 mt-1">{passwordError}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Verifying...' : 'View Presentation'}
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  if (!presentation) {
    return null
  }

  return (
    <PresentationSlideshow
      slides={presentation.slides}
      projectName={presentation.title}
      onClose={() => navigate('/')}
    />
  )
}
