import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coffee, Check, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Button from '../components/Button'
import Input from '../components/Input'

type Step = 1 | 2 | 3

export default function Onboarding() {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Step 1: Welcome
  const [name, setName] = useState(user?.name || '')

  // Step 2: Workspace
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')

  // Step 3: Brand
  const [brandName, setBrandName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#7C3AED')
  const [secondaryColor, setSecondaryColor] = useState('#6EE7B7')

  const handleStep1 = async () => {
    if (!name.trim()) return
    
    setLoading(true)
    try {
      await supabase
        .from('v2_users')
        .update({ name })
        .eq('id', user!.id)
      
      setStep(2)
    } catch (error) {
      console.error('Error updating name:', error)
    } finally {
      setLoading(false)
    }
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
          workspace_id: workspaceId,
          name: brandName,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          font_heading: 'Inter',
          font_body: 'Inter'
        })
      
      navigate('/dashboard')
    } catch (error) {
      console.error('Error creating brand:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-2">
          <Coffee className="w-8 h-8 text-primary-600" />
          <span className="text-2xl font-bold text-gray-900">SlideCoffee</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="flex items-center justify-between mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-1 mx-2 ${
                  step > s ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-6 max-w-2xl">
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Welcome to SlideCoffee
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Let's get you started!
              </h1>
              <p className="text-lg text-gray-600">
                First, tell us what we should call you
              </p>
            </div>
            
            <div className="space-y-6">
              <Input
                label="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="text-lg"
              />
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Skip for now
                </Button>
                <Button
                  size="lg"
                  onClick={handleStep1}
                  disabled={!name.trim() || loading}
                  className="flex-1"
                >
                  {loading ? 'Saving...' : 'Continue'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Create your workspace
              </h1>
              <p className="text-lg text-gray-600">
                Organize your presentations in workspaces
              </p>
            </div>
            
            <div className="space-y-6">
              <Input
                label="Workspace Name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g., My Company, Personal Projects"
                className="text-lg"
              />
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  💡 <strong>Tip:</strong> You can create multiple workspaces later to separate different projects or clients.
                </p>
              </div>
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Skip for now
                </Button>
                <Button
                  size="lg"
                  onClick={handleStep2}
                  disabled={!workspaceName.trim() || loading}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Continue'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Set up your brand
              </h1>
              <p className="text-lg text-gray-600">
                Define your brand colors for consistent presentations
              </p>
            </div>
            
            <div className="space-y-6">
              <Input
                label="Brand Name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g., Company Brand, Personal Brand"
                className="text-lg"
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
                      className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#7C3AED"
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
                      className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#6EE7B7"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
                <div className="flex gap-3">
                  <div
                    className="w-24 h-24 rounded-lg shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div
                    className="w-24 h-24 rounded-lg shadow-sm"
                    style={{ backgroundColor: secondaryColor }}
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Skip for now
                </Button>
                <Button
                  size="lg"
                  onClick={handleStep3}
                  disabled={!brandName.trim() || loading}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-sm text-gray-500">
        Step {step} of 3
      </div>
    </div>
  )
}

