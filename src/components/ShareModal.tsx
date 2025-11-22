import { useState, useEffect } from 'react'
import { Copy, Check, Lock, Clock, Globe, AlertCircle } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import { useAuth } from '../contexts/AuthContext'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  presentationId: string
  presentationTitle: string
}

interface ShareSettings {
  success?: boolean
  enabled: boolean
  access: 'unlimited' | 'limited'
  hasPassword: boolean
  expiresAt?: string
  shareUrl?: string
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  presentationId,
  presentationTitle 
}: ShareModalProps) {
  const { session } = useAuth()
  const [shareUrl, setShareUrl] = useState('')
  const [accessType, setAccessType] = useState<'unlimited' | 'limited'>('unlimited')
  const [password, setPassword] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isEnabled, setIsEnabled] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && presentationId) {
      loadShareSettings()
    }
  }, [isOpen, presentationId])

  const loadShareSettings = async () => {
    try {
      setInitialLoading(true)
      setError(null)
      const response = await fetch(`/api/presentations/${presentationId}/share`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      const data: ShareSettings = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load share settings')
      }

      if (data.enabled && data.shareUrl) {
        setIsEnabled(true)
        setShareUrl(data.shareUrl)
        setAccessType(data.access)
        setExpiresAt(data.expiresAt || '')
      }
    } catch (error: any) {
      console.error('Error loading share settings:', error)
      setError(error.message)
    } finally {
      setInitialLoading(false)
    }
  }

  const generateShareLink = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/presentations/${presentationId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          access: accessType,
          password: password || undefined,
          expiresAt: expiresAt || undefined,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate share link')
      }

      setShareUrl(data.shareUrl)
      setIsEnabled(true)
    } catch (error: any) {
      console.error('Error generating share link:', error)
      setError(error.message || 'Failed to generate share link')
    } finally {
      setLoading(false)
    }
  }

  const revokeShareLink = async () => {
    if (!confirm('Are you sure you want to revoke this share link? Anyone with the link will no longer be able to access the presentation.')) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/presentations/${presentationId}/share`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke share link')
      }

      setShareUrl('')
      setIsEnabled(false)
      setPassword('')
      setExpiresAt('')
      setAccessType('unlimited')
    } catch (error: any) {
      console.error('Error revoking share link:', error)
      setError(error.message || 'Failed to revoke share link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Share Presentation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        <div className="p-6 space-y-6">
        {initialLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Loading share settings...</p>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {presentationTitle}
              </h3>
              <p className="text-sm text-gray-600">
                Create a shareable link to present this slideshow to others
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-700"
                >
                  &times;
                </button>
              </div>
            )}

            {!isEnabled ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAccessType('unlimited')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        accessType === 'unlimited'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Globe className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                      <div className="font-medium text-sm">Public</div>
                      <div className="text-xs text-gray-600">Anyone with link</div>
                    </button>
                    <button
                      onClick={() => setAccessType('limited')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        accessType === 'limited'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Lock className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                      <div className="font-medium text-sm">Protected</div>
                      <div className="text-xs text-gray-600">Password required</div>
                    </button>
                  </div>
                </div>

                {accessType === 'limited' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set a password"
                      minLength={8}
                      maxLength={72}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Viewers will need this password to access the presentation
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration (Optional)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="pl-10"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Link will automatically expire after this date
                  </p>
                </div>

                <Button
                  onClick={generateShareLink}
                  disabled={loading || (accessType === 'limited' && !password.trim())}
                  className="w-full"
                >
                  {loading ? 'Generating...' : 'Generate Share Link'}
                </Button>
                {accessType === 'limited' && !password.trim() && (
                  <p className="text-xs text-red-600 text-center">
                    Password is required for protected presentations
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800 mb-2">
                        Share link is active
                      </p>
                      <div className="flex items-center gap-2">
                        <Input
                          value={shareUrl}
                          readOnly
                          className="flex-1 text-sm font-mono"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={copyToClipboard}
                          className="flex-shrink-0"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Share Settings</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Access:</span>
                    <span className="font-medium">
                      {accessType === 'unlimited' ? 'Public - Anyone with link' : 'Protected - Password required'}
                    </span>
                  </div>
                  {expiresAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Expires:</span>
                      <span className="font-medium">
                        {new Date(expiresAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={revokeShareLink}
                    disabled={loading}
                    className="flex-1 text-red-600 hover:bg-red-50"
                  >
                    {loading ? 'Revoking...' : 'Revoke Link'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  )
}
