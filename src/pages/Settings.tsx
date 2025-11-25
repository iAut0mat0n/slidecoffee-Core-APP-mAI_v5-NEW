import { useState } from 'react'
import { User, CreditCard, Users, Shield, Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import DashboardLayout from '../components/DashboardLayout'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import { usersAPI } from '../lib/api-client'

type Tab = 'profile' | 'subscription' | 'team' | 'security' | 'notifications'

export default function Settings() {
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [saving, setSaving] = useState(false)

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  const handleSaveProfile = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      await usersAPI.updateProfile({ name: profileData.name })
      await refreshUser?.()
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'subscription' as Tab, label: 'Subscription', icon: CreditCard },
    { id: 'team' as Tab, label: 'Team', icon: Users },
    { id: 'security' as Tab, label: 'Security', icon: Shield },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
  ]

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="flex gap-8">
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
                        ? 'bg-purple-50 text-purple-700 font-medium'
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

          <div className="flex-1">
            {activeTab === 'profile' && (
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Change Avatar</Button>
                      <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  <Input
                    label="Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Your name"
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={profileData.email}
                    disabled
                    placeholder="your@email.com"
                  />

                  <div className="pt-4">
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'subscription' && (
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription</h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                          {user?.plan || 'Starter'} Plan
                        </h3>
                        <p className="text-gray-600">Current subscription</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-600">{user?.credits || 0}</div>
                        <div className="text-sm text-gray-600">Credits remaining</div>
                      </div>
                    </div>
                    <Button>Upgrade Plan</Button>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Available Plans</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {['Starter', 'Professional', 'Enterprise'].map((plan) => (
                        <Card key={plan} className="p-6">
                          <h4 className="font-semibold text-gray-900 mb-2">{plan}</h4>
                          <div className="text-2xl font-bold text-gray-900 mb-4">
                            {plan === 'Starter' && '$0'}
                            {plan === 'Professional' && '$29'}
                            {plan === 'Enterprise' && '$99'}
                            <span className="text-sm font-normal text-gray-600">/mo</span>
                          </div>
                          <ul className="space-y-2 text-sm text-gray-600 mb-4">
                            <li>✓ {plan === 'Starter' && '75 credits/month'}</li>
                            <li>✓ {plan === 'Professional' && '500 credits/month'}</li>
                            <li>✓ {plan === 'Enterprise' && 'Unlimited credits'}</li>
                          </ul>
                          <Button
                            variant={user?.plan === plan.toLowerCase() ? 'secondary' : 'primary'}
                            size="sm"
                            className="w-full"
                            disabled={user?.plan === plan.toLowerCase()}
                          >
                            {user?.plan === plan.toLowerCase() ? 'Current Plan' : 'Upgrade'}
                          </Button>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'team' && (
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Team Management</h2>
                <p className="text-gray-600 mb-6">Invite team members to collaborate on presentations</p>
                <div className="flex gap-4 mb-6">
                  <Input placeholder="Enter email address" className="flex-1" />
                  <Button>Send Invite</Button>
                </div>
                <div className="text-center py-12 text-gray-500">
                  No team members yet
                </div>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <Input type="password" label="Current Password" placeholder="••••••••" />
                      <Input type="password" label="New Password" placeholder="••••••••" />
                      <Input type="password" label="Confirm New Password" placeholder="••••••••" />
                      <Button>Update Password</Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <p className="text-gray-600 mb-4">Add an extra layer of security to your account</p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Email notifications', description: 'Receive email updates about your presentations' },
                    { label: 'Collaboration updates', description: 'Get notified when someone comments or edits' },
                    { label: 'Marketing emails', description: 'Receive tips and product updates' },
                    { label: 'Credit alerts', description: 'Get notified when credits are running low' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">{item.label}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
