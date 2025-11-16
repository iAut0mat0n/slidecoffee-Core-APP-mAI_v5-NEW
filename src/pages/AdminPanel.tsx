import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, CreditCard, BarChart3, Zap, Database, FileText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type AISettings } from '../lib/supabase'
import Button from '../components/Button'
import Card from '../components/Card'
// import Input from '../components/Input'

type Tab = 'overview' | 'users' | 'subscriptions' | 'analytics' | 'ai-settings' | 'database' | 'logs'

export default function AdminPanel() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [aiSettings, setAiSettings] = useState<AISettings[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    
    loadAISettings()
  }, [user])

  const loadAISettings = async () => {
    try {
      const { data, error } = await supabase
        .from('v2_ai_settings')
        .select('*')
        .order('provider')
      
      if (error) throw error
      setAiSettings(data || [])
    } catch (error) {
      console.error('Error loading AI settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProvider = async (providerId: string, isActive: boolean) => {
    try {
      // Deactivate all providers first
      await supabase
        .from('v2_ai_settings')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000')
      
      // Activate selected provider
      const { error } = await supabase
        .from('v2_ai_settings')
        .update({ is_active: !isActive })
        .eq('id', providerId)
      
      if (error) throw error
      loadAISettings()
    } catch (error) {
      console.error('Error toggling provider:', error)
    }
  }

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: BarChart3 },
    { id: 'users' as Tab, label: 'Users', icon: Users },
    { id: 'subscriptions' as Tab, label: 'Subscriptions', icon: CreditCard },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
    { id: 'ai-settings' as Tab, label: 'AI Settings', icon: Zap },
    { id: 'database' as Tab, label: 'Database', icon: Database },
    { id: 'logs' as Tab, label: 'Logs', icon: FileText },
  ]

  if (user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">System management and configuration</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card className="p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="text-sm text-gray-600 mb-1">Total Users</div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-green-600 mt-1">+0 this month</div>
                  </Card>
                  <Card className="p-6">
                    <div className="text-sm text-gray-600 mb-1">Active Subscriptions</div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-green-600 mt-1">+0 this month</div>
                  </Card>
                  <Card className="p-6">
                    <div className="text-sm text-gray-600 mb-1">Total Presentations</div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-600 mt-1">All time</div>
                  </Card>
                  <Card className="p-6">
                    <div className="text-sm text-gray-600 mb-1">Credits Used</div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-600 mt-1">This month</div>
                  </Card>
                </div>

                <Card className="p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-900">Database</span>
                      </div>
                      <span className="text-sm text-green-600">Operational</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-900">AI Services</span>
                      </div>
                      <span className="text-sm text-green-600">Operational</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-900">Storage</span>
                      </div>
                      <span className="text-sm text-green-600">Operational</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'users' && (
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">User Management</h2>
                <div className="text-center py-12 text-gray-500">
                  No users to display
                </div>
              </Card>
            )}

            {activeTab === 'subscriptions' && (
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription Management</h2>
                <div className="text-center py-12 text-gray-500">
                  No subscriptions to display
                </div>
              </Card>
            )}

            {activeTab === 'analytics' && (
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics</h2>
                <div className="text-center py-12 text-gray-500">
                  Analytics coming soon
                </div>
              </Card>
            )}

            {activeTab === 'ai-settings' && (
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Provider Settings</h2>
                <p className="text-gray-600 mb-6">
                  Configure which AI provider to use for slide generation
                </p>
                
                <div className="space-y-4">
                  {[
                    { provider: 'manus', label: 'Manus AI', model: 'gemini-2.0-flash-exp', description: 'Fast and cost-effective' },
                    { provider: 'claude', label: 'Claude (Anthropic)', model: 'claude-3-5-sonnet', description: 'High quality, best for complex presentations' },
                    { provider: 'gpt4', label: 'GPT-4 (OpenAI)', model: 'gpt-4-turbo', description: 'Versatile and reliable' },
                  ].map((item) => {
                    const setting = aiSettings.find(s => s.provider === item.provider)
                    const isActive = setting?.is_active || false
                    
                    return (
                      <div
                        key={item.provider}
                        className={`p-6 border-2 rounded-lg transition-all ${
                          isActive
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{item.label}</h3>
                              {isActive && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                            <p className="text-xs text-gray-500">Model: {item.model}</p>
                          </div>
                          <Button
                            variant={isActive ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => setting && handleToggleProvider(setting.id, isActive)}
                            disabled={loading}
                          >
                            {isActive ? 'Active' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Changing the AI provider will affect all new presentations. 
                    Existing presentations will continue using their original provider.
                  </p>
                </div>
              </Card>
            )}

            {activeTab === 'database' && (
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Database Management</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Database Size</div>
                      <div className="text-sm text-gray-600">Total storage used</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">0 MB</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Total Records</div>
                      <div className="text-sm text-gray-600">Across all tables</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'logs' && (
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">System Logs</h2>
                <div className="text-center py-12 text-gray-500">
                  No logs to display
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

