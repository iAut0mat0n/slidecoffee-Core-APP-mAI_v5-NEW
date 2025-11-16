import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coffee, Check, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Button from '../components/Button'
import Input from '../components/Input'

type Step = 0 | 1 | 2 | 3

export default function Onboarding() {
  const [step, setStep] = useState<Step>(0)
  const [loading, setLoading] = useState(false)
  const { user, signInWithGoogle, signUp } = useAuth()
  const navigate = useNavigate()

  // Step 0: Signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  // Step 2: Workspace
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')

  // Step 3: Brand
  const [brandName, setBrandName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#7C3AED')
  const [secondaryColor, setSecondaryColor] = useState('#6EE7B7')

  useEffect(() => {
    // If user is already logged in, skip to step 1
    if (user && step === 0) {
      setStep(1)
      setName(user.name || '')
    }
  }, [user])

  const handleGoogleSignup = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Error signing up with Google:', error)
      alert('Failed to sign up with Google')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignup = async () => {
    if (!email || !password || !name) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, name)
      setStep(1)
    } catch (error: any) {
      console.error('Error signing up:', error)
      alert(error.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleStep1 = () => {
    if (!name.trim()) return
    setStep(2)
  }

  const handleStep2 = async () => {
    if (!workspaceName.trim()) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('v2_workspaces')
        .insert({
          name: workspaceName,
          owner_id: user!.id
        })
        .select()
        .single()
      
      if (error) throw error
      setWorkspaceId(data.id)
      setStep(3)
    } catch (error) {
      console.error('Error creating workspace:', error)
      alert('Failed to create workspace')
    } finally {
      setLoading(false)
    }
  }

  const handleStep3 = async () => {
    if (!brandName.trim()) return
    
    setLoading(true)
    try {
      await supabase
        .from('v2_brands')
        .insert({
          name: brandName,
          workspace_id: workspaceId,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          created_by: user!.id
        })
      
      navigate('/dashboard')
    } catch (error) {
      console.error('Error creating brand:', error)
      alert('Failed to create brand')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-2">
          <Coffee className="w-8 h-8 text-purple-600" />
          <span className="text-2xl font-bold">SlideCoffee</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[0, 1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s <= step ? 'w-12 bg-purple-600' : 'w-8 bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Step 0: Sign Up */}
            {step === 0 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Welcome to SlideCoffee</h2>
                  <p className="text-gray-600">Create your account to get started</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleGoogleSignup}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors font-medium disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                    </div>
                  </div>

                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <Input
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <Button
                    onClick={handleEmailSignup}
                    disabled={loading || !email || !password || !name}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Welcome */}
            {step === 1 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Welcome, {name}!</h2>
                  <p className="text-gray-600">Let's set up your workspace</p>
                </div>

                <Button
                  onClick={handleStep1}
                  disabled={!name.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  Continue
                </Button>
              </div>
            )}

            {/* Step 2: Workspace */}
            {step === 2 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Coffee className="w-8 h-8 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Create Your Workspace</h2>
                  <p className="text-gray-600">A workspace helps you organize your presentations</p>
                </div>

                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Workspace Name (e.g., My Company)"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />

                  <Button
                    onClick={handleStep2}
                    disabled={loading || !workspaceName.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Continue'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Brand */}
            {step === 3 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Create Your First Brand</h2>
                  <p className="text-gray-600">Define your brand colors for consistent presentations</p>
                </div>

                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Brand Name (e.g., Acme Corp)"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleStep3}
                    disabled={loading || !brandName.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Get Started'}
                  </Button>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

