import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, CreditCard, BarChart3, Zap, Database, FileText, Key } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type AISettings } from '../lib/supabase'
import { adminAPI } from '../lib/api-client'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'

type Tab = 'overview' | 'users' | 'subscriptions' | 'analytics' | 'ai-settings' | 'database' | 'logs'

export default function AdminPanel() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [aiSettings, setAiSettings] = useState<AISettings[]>([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalProjects: 0,
    creditsUsed: 0,
  })
  const [configuring, setConfiguring] = useState<string | null>(null)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [aiData, usersData, subsData, statsData] = await Promise.all([
        supabase.from('v2_ai_settings').select('*').order('provider'),
        adminAPI.getUsers().catch(() => []),
        adminAPI.getSubscriptions().catch(() => []),
        adminAPI.getStats().catch(() => ({ totalUsers: 0, activeSubscriptions: 0, totalProjects: 0, creditsUsed: 0 })),
      ])
      
      if (!aiData.error) setAiSettings(aiData.data || [])
      setUsers(usersData)
      setSubscriptions(subsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading admin data:', error)
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
      loadData()
    } catch (error) {
      console.error('Error toggling provider:', error)
    }
  }

  const handleConfigureProvider = (providerId: string) => {
    setConfiguring(providerId)
    setApiKeyInput('')
    setShowApiKey(false)
  }

  const handleSaveApiKey = async (settingId: string) => {
    if (!apiKeyInput.trim()) {
      alert('Please enter an API key')
      return
    }

    try {
      await adminAPI.updateAISettings(settingId, { api_key: apiKeyInput })
      setConfiguring(null)
      setApiKeyInput('')
      loadData()
      alert('API key saved successfully!')
    } catch (error) {
      console.error('Error saving API key:', error)
      alert('Failed to save API key')
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
                    <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
                    <div className="text-sm text-gray-600 mt-1">All time</div>
                  </Card>
                  <Card className="p-6">
                    <div className="text-sm text-gray-600 mb-1">Active Subscriptions</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</div>
                    <div className="text-sm text-gray-600 mt-1">Pro & Enterprise</div>
                  </Card>
                  <Card className="p-6">
                    <div className="text-sm text-gray-600 mb-1">Total Projects</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalProjects}</div>
                    <div className="text-sm text-gray-600 mt-1">All time</div>
                  </Card>
                  <Card className="p-6">
                    <div className="text-sm text-gray-600 mb-1">AI Provider</div>
                    <div className="text-xl font-bold text-gray-900">{aiSettings.find(s => s.is_active)?.provider || 'None'}</div>
                    <div className="text-sm text-gray-600 mt-1">Currently active</div>
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
                {users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Email</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Name</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Role</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Plan</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{u.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{u.name || '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{u.plan || 'starter'}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${u.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {u.subscription_status || 'free'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{new Date(u.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    {loading ? 'Loading users...' : 'No users to display'}
                  </div>
                )}
              </Card>
            )}

            {activeTab === 'subscriptions' && (
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription Management</h2>
                {subscriptions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">User</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Plan</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Period End</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Stripe ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {subscriptions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{sub.name || sub.email}</div>
                              <div className="text-xs text-gray-500">{sub.email}</div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                {sub.plan}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${sub.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {sub.subscription_status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {sub.subscription_current_period_end ? new Date(sub.subscription_current_period_end).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                              {sub.stripe_subscription_id?.substring(0, 20)}...
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    {loading ? 'Loading subscriptions...' : 'No active subscriptions'}
                  </div>
                )}
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
                  Configure which AI provider to use for slide generation. <strong>Claude 3.5 Haiku</strong> is the primary provider.
                </p>
                
                <div className="space-y-4">
                  {[
                    { provider: 'claude-haiku', label: 'Claude 3.5 Haiku', model: 'claude-3-5-haiku-20241022', description: '⭐ Primary provider - Fast, efficient, and high-quality' },
                    { provider: 'claude', label: 'Claude 3.5 Sonnet', model: 'claude-3-5-sonnet-20241022', description: 'Highest quality for complex presentations' },
                    { provider: 'manus', label: 'Manus AI', model: 'gemini-2.0-flash-exp', description: 'Alternative provider (Gemini-powered)' },
                    { provider: 'gpt4', label: 'GPT-4 Turbo', model: 'gpt-4-turbo', description: 'Alternative provider from OpenAI' },
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
                        {configuring === setting?.id ? (
                          <div className="space-y-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{item.label}</h3>
                                <p className="text-sm text-gray-600">Configure API Key</p>
                              </div>
                              <button
                                onClick={() => setConfiguring(null)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  API Key
                                </label>
                                <div className="relative">
                                  <Input
                                    type={showApiKey ? 'text' : 'password'}
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                    placeholder={`Enter ${item.label} API key`}
                                    className="pr-20"
                                  />
                                  <button
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                                  >
                                    {showApiKey ? 'Hide' : 'Show'}
                                  </button>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => setting && handleSaveApiKey(setting.id)}
                                  size="sm"
                                >
                                  Save API Key
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setConfiguring(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{item.label}</h3>
                                {isActive && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                    Active
                                  </span>
                                )}
                                {setting?.api_key && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded flex items-center gap-1">
                                    <Key className="w-3 h-3" />
                                    Configured
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                              <p className="text-xs text-gray-500">Model: {item.model}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setting && handleConfigureProvider(setting.id)}
                                disabled={loading}
                              >
                                Configure
                              </Button>
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
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Getting API Keys:</strong>
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                      <li><strong>Claude 3.5 Haiku (Primary):</strong> Get API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">Anthropic Console</a></li>
                      <li>Claude 3.5 Sonnet: Same API key works for both Claude models</li>
                      <li>Manus AI: Already configured via environment variables</li>
                      <li>GPT-4: Get from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a></li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Changing the AI provider will affect all new presentations. 
                      Existing presentations will continue using their original provider.
                    </p>
                  </div>
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

