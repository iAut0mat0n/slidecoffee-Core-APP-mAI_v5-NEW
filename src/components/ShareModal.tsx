import { useState } from 'react'
import { Copy, Check, Lock, Clock, Globe } from 'lucide-react'
import Button from './Button'
import Input from './Input'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  presentationId: string
  presentationTitle: string
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  presentationId,
  presentationTitle 
}: ShareModalProps) {
  if (!isOpen) return null
  const [shareUrl, setShareUrl] = useState('')
  const [accessType, setAccessType] = useState<'unlimited' | 'limited'>('unlimited')
  const [password, setPassword] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isEnabled, setIsEnabled] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const generateShareLink = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/presentations/${presentationId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          access: accessType,
          password: password || null,
          expiresAt: expiresAt || null,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate share link')
      }

      const data = await response.json()
      setShareUrl(data.shareUrl)
      setIsEnabled(true)
    } catch (error) {
      console.error('Error generating share link:', error)
      alert('Failed to generate share link')
    } finally {
      setLoading(false)
    }
  }

  const updateShareSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/presentations/${presentationId}/share`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          enabled: isEnabled,
          access: accessType,
          password: password || null,
          expiresAt: expiresAt || null,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update share settings')
      }
    } catch (error) {
      console.error('Error updating share settings:', error)
      alert('Failed to update share settings')
    } finally {
      setLoading(false)
    }
  }

  const revokeShareLink = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/presentations/${presentationId}/share`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to revoke share link')
      }

      setShareUrl('')
      setIsEnabled(false)
      setPassword('')
      setExpiresAt('')
    } catch (error) {
      console.error('Error revoking share link:', error)
      alert('Failed to revoke share link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {presentationTitle}
          </h3>
          <p className="text-sm text-gray-600">
            Create a shareable link to present this slideshow to others
          </p>
        </div>

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
                  <div className="font-medium text-sm">Unlimited</div>
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
                  <div className="font-medium text-sm">Limited</div>
                  <div className="text-xs text-gray-600">Password protected</div>
                </button>
              </div>
            </div>

            {accessType === 'limited' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password (Optional)
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set a password"
                />
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
                />
              </div>
            </div>

            <Button
              onClick={generateShareLink}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate Share Link'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 mb-1">
                    Share link is active
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="flex-1 text-sm"
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

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Access:</span>
                <span className="font-medium">{accessType === 'unlimited' ? 'Anyone with link' : 'Password protected'}</span>
              </div>
              {password && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Password:</span>
                  <span className="font-medium">••••••</span>
                </div>
              )}
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
                onClick={updateShareSettings}
                disabled={loading}
                className="flex-1"
              >
                Update Settings
              </Button>
              <Button
                variant="secondary"
                onClick={revokeShareLink}
                disabled={loading}
                className="flex-1 text-red-600 hover:bg-red-50"
              >
                Revoke Link
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
