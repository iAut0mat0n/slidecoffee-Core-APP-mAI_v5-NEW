import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Coffee, 
  LayoutDashboard, 
  Briefcase, 
  Palette, 
  FileText, 
  Sparkles, 
  Settings, 
  Clock, 
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Plus
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { workspacesAPI } from '../lib/api-client'

interface NavItem {
  icon: React.ReactNode
  label: string
  path: string
}

type Workspace = {
  id: string
  name: string
  role?: string
}

export default function CollapsibleSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isWorkspaceSwitcherOpen, setIsWorkspaceSwitcherOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [workspacesLoading, setWorkspacesLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  // Fetch workspaces on mount
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

  const mainNav: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Briefcase size={20} />, label: 'Brews', path: '/brews' },
    { icon: <Palette size={20} />, label: 'Brands', path: '/brands' },
    { icon: <FileText size={20} />, label: 'Templates', path: '/templates-new' },
    { icon: <Sparkles size={20} />, label: 'Themes', path: '/themes' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ]

  const quickAccess: NavItem[] = [
    { icon: <Clock size={20} />, label: 'Recent', path: '/recent' },
    { icon: <Star size={20} />, label: 'Favorites', path: '/favorites' },
  ]

  const isActive = (path: string) => {
    if (path === '/brews') {
      return location.pathname === '/brews' || location.pathname.startsWith('/brews/')
    }
    return location.pathname === path
  }

  const handleSignOut = async () => {
    setIsUserMenuOpen(false)
    await signOut()
    navigate('/')
  }

  const handleUpgrade = () => {
    setIsUserMenuOpen(false)
    navigate('/subscription')
  }

  const handleCreateWorkspace = () => {
    setIsWorkspaceSwitcherOpen(false)
    navigate('/onboarding/workspace')
  }

  const switchWorkspace = (ws: Workspace) => {
    setCurrentWorkspace(ws)
    setIsWorkspaceSwitcherOpen(false)
  }

  // Get user display info
  const userName = user?.name || user?.email?.split('@')[0] || 'User'
  const userInitial = userName.charAt(0).toUpperCase()
  const userCredits = user?.credits ?? 0
  const userPlan = user?.plan || 'espresso'
  const planDisplayName = userPlan === 'espresso' ? 'Free' : 
                          userPlan === 'americano' ? 'Pro' : 
                          userPlan === 'cappuccino' ? 'Team' : 'Enterprise'

  return (
    <div 
      className={`
        h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Header with Logo and Workspace Switcher */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => setIsWorkspaceSwitcherOpen(!isWorkspaceSwitcherOpen)}
                className="flex items-center gap-2 flex-1 hover:bg-gray-50 rounded-lg p-2 -ml-2 min-w-0"
                disabled={workspacesLoading}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-purple-700">
                      {currentWorkspace?.name?.[0] || 'W'}
                    </span>
                  </div>
                  <span className="font-semibold text-sm truncate">
                    {workspacesLoading ? 'Loading...' : (currentWorkspace?.name || 'My Workspace')}
                  </span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${isWorkspaceSwitcherOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <Coffee className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Workspace Switcher Dropdown */}
        {isWorkspaceSwitcherOpen && !isCollapsed && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-2">WORKSPACES</div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => switchWorkspace(ws)}
                  className={`w-full text-left px-3 py-2 hover:bg-white rounded-lg text-sm transition-colors ${
                    ws.id === currentWorkspace?.id ? 'bg-purple-50 text-purple-700 font-medium' : ''
                  }`}
                >
                  {ws.name}
                </button>
              ))}
              <button 
                onClick={handleCreateWorkspace}
                className="w-full text-left px-3 py-2 hover:bg-white rounded-lg text-sm text-purple-600 flex items-center gap-2"
              >
                <Plus size={14} />
                Create workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Main Nav Section */}
        <div className="px-3">
          {!isCollapsed && (
            <div className="text-xs font-semibold text-gray-400 px-3 mb-2">
              MENU
            </div>
          )}
          <nav className="space-y-1">
            {mainNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive(item.path) 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Quick Access Section */}
        <div className="px-3 mt-6">
          {!isCollapsed && (
            <div className="text-xs font-semibold text-gray-400 px-3 mb-2">
              QUICK ACCESS
            </div>
          )}
          <nav className="space-y-1">
            {quickAccess.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive(item.path) 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-4">
        {!isCollapsed ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={userName} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">{userInitial}</span>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-semibold truncate">{userName}</div>
                <div className="text-xs text-gray-500 truncate">{user?.email || ''}</div>
              </div>
              <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Credits Display */}
            <div className="mt-2 px-2">
              <div className="text-xs text-gray-500 mb-1">{userCredits.toLocaleString()} credits</div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  {planDisplayName}
                </span>
                <button 
                  onClick={handleUpgrade}
                  className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Upgrade
                </button>
              </div>
            </div>

            {/* User Menu Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
                <Link
                  to="/settings"
                  className="block px-3 py-2 text-sm hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  to="/subscription"
                  className="block px-3 py-2 text-sm hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Subscription
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg text-red-600 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mx-auto hover:bg-purple-700 transition-colors overflow-hidden"
              title={userName}
            >
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={userName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-white font-semibold text-sm">{userInitial}</span>
              )}
            </button>
            
            {/* Collapsed User Menu */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 w-48">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <div className="text-sm font-semibold truncate">{userName}</div>
                  <div className="text-xs text-gray-500">{userCredits.toLocaleString()} credits</div>
                </div>
                <Link
                  to="/settings"
                  className="block px-3 py-2 text-sm hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  to="/subscription"
                  className="block px-3 py-2 text-sm hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Subscription
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg text-red-600 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm z-10"
      >
        {isCollapsed ? (
          <ChevronRight size={14} className="text-gray-600" />
        ) : (
          <ChevronLeft size={14} className="text-gray-600" />
        )}
      </button>
    </div>
  )
}
