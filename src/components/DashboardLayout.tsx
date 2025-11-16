import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Coffee, LayoutDashboard, Tag, Folder, Clock, Star, Settings, LogOut, ChevronDown, Search, Plus, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Button from './Button'

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleCreateNew = () => {
    // TODO: Open create project modal or navigate to editor
    navigate('/editor/new')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">SlideCoffee</span>
          </div>
        </div>

        {/* Workspace Selector */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{user?.name?.[0] || 'U'}</span>
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">My Workspace</div>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${workspaceMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/dashboard')
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => navigate('/brands')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/brands')
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Tag className="w-5 h-5" />
            <span className="font-medium">Brands</span>
          </button>

          <button
            onClick={() => navigate('/projects')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/projects')
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Folder className="w-5 h-5" />
            <span className="font-medium">Projects</span>
          </button>

          {/* Quick Access Section */}
          <div className="pt-6">
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Access</span>
            </div>

            <button
              onClick={() => navigate('/recent')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Clock className="w-5 h-5" />
              <span className="font-medium">Recent</span>
            </button>

            <button
              onClick={() => navigate('/favorites')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Star className="w-5 h-5" />
              <span className="font-medium">Favorites</span>
            </button>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-purple-700">{user?.name?.[0] || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500">{user?.credits || 0} credits</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/settings')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleCreateNew}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create new
              </Button>
              <button className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium text-sm flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                AI
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

