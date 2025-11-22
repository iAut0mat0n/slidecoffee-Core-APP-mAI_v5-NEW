import { useState } from 'react'
import { User, CreditCard, Bell, Shield, Palette, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import CollapsibleSidebar from '../components/CollapsibleSidebar'
import BillingSettings from '../components/BillingSettings'

type SettingsTab = 'profile' | 'subscription' | 'notifications' | 'security' | 'appearance' | 'integrations'

export default function SettingsNew() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Zap },
  ] as const

  return (
    <div className="flex h-screen bg-gray-50">
      <CollapsibleSidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <h1 className="text-4xl font-bold mb-8">Settings</h1>

          <div className="flex gap-8">
            {/* Sidebar Tabs */}
            <div className="w-64 flex-shrink-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                        ${activeTab === tab.id
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon size={20} />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-8">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Profile</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.name || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Avatar
                      </label>
                      <div className="flex items-center gap-4">
                        <img
                          src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=7C3AED&color=fff`}
                          alt="Avatar"
                          className="w-16 h-16 rounded-full"
                        />
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          Change Avatar
                        </button>
                      </div>
                    </div>
                    <div className="pt-4">
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'subscription' && (
                <BillingSettings />
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Notifications</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Email notifications', description: 'Receive email updates about your presentations' },
                      { label: 'Push notifications', description: 'Get notified about important updates' },
                      { label: 'Marketing emails', description: 'Receive tips and product updates' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Security</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <input
                          type="password"
                          placeholder="Current password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="password"
                          placeholder="New password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="font-semibold mb-4 text-red-600">Danger Zone</h3>
                      <button className="border border-red-600 text-red-600 hover:bg-red-50 px-6 py-2 rounded-lg transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Appearance</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-4">Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {['Light', 'Dark', 'System'].map((theme) => (
                          <button
                            key={theme}
                            className="p-4 border-2 border-gray-300 rounded-lg hover:border-purple-600 transition-colors"
                          >
                            {theme}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Integrations</h2>
                  <p className="text-gray-500">No integrations available yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

