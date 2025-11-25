import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Coffee, LayoutDashboard, Tag, Folder, Clock, Star, Settings, LogOut, ChevronDown, Search, Plus, Sparkles, PanelLeftClose, PanelLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { workspacesAPI } from '../lib/api-client'
import Button from './Button'

type DashboardLayoutProps = {
  children: ReactNode
}

type Workspace = {
  id: string
  name: string
  role: string
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [workspacesLoading, setWorkspacesLoading] = useState(true)

  useEffect(() => {
    const loadWorkspaces = async () => {
      if (!user) {
        setWorkspacesLoading(false)
        return
      }
      try {
        const data = await workspacesAPI.list()
        setWorkspaces(data || [])
        if (data && data.length > 0) {
          const defaultWs = user?.default_workspace_id 
            ? data.find((w: Workspace) => w.id === user.default_workspace_id) 
            : data[0]
          setCurrentWorkspace(defaultWs || data[0])
        }
      } catch (error) {
        console.error('Failed to load workspaces:', error)
        setWorkspaces([])
      } finally {
        setWorkspacesLoading(false)
      }
    }
    loadWorkspaces()
  }, [user])

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleCreateNew = () => {
    navigate('/brews')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && <span className="text-xl font-bold">SlideCoffee</span>}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={workspacesLoading}
            >
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-purple-700">
                  {currentWorkspace?.name?.[0] || user?.name?.[0] || 'W'}
                </span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium truncate">
                  {workspacesLoading ? 'Loading...' : (currentWorkspace?.name || 'My Workspace')}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${workspaceMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {workspaceMenuOpen && workspaces.length > 0 && (
              <div className="mt-2 py-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setCurrentWorkspace(ws)
                      setWorkspaceMenuOpen(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      ws.id === currentWorkspace?.id ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                    }`}
                  >
                    {ws.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <nav className="flex-1 p-2 space-y-1">
          <button
            onClick={() => navigate('/brews')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/brews') || location.pathname.startsWith('/brews')
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'
            } ${sidebarCollapsed ? 'justify-center' : ''}`}
            title="Brews"
          >
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Brews</span>}
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/dashboard')
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'
            } ${sidebarCollapsed ? 'justify-center' : ''}`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
          </button>

          <button
            onClick={() => navigate('/brands')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/brands')
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'
            } ${sidebarCollapsed ? 'justify-center' : ''}`}
            title="Brands"
          >
            <Tag className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Brands</span>}
          </button>

          <button
            onClick={() => navigate('/projects')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/projects') || location.pathname.startsWith('/projects')
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'
            } ${sidebarCollapsed ? 'justify-center' : ''}`}
            title="Projects"
          >
            <Folder className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Projects</span>}
          </button>

          {!sidebarCollapsed && (
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
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-purple-700">{user?.name?.[0] || 'U'}</span>
                  )}
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
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Expand sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-medium text-purple-700">{user?.name?.[0] || 'U'}</span>
                )}
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
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

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
