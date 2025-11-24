import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
  User
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface NavItem {
  icon: React.ReactNode
  label: string
  path: string
}

export default function CollapsibleSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isWorkspaceSwitcherOpen, setIsWorkspaceSwitcherOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, signOut } = useAuth()

  const mainNav: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Briefcase size={20} />, label: 'Brews', path: '/projects' },
    { icon: <Palette size={20} />, label: 'Brands', path: '/brands' },
    { icon: <FileText size={20} />, label: 'Templates', path: '/templates' },
    { icon: <Sparkles size={20} />, label: 'Themes', path: '/themes' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ]

  const quickAccess: NavItem[] = [
    { icon: <Clock size={20} />, label: 'Recent', path: '/recent' },
    { icon: <Star size={20} />, label: 'Favorites', path: '/favorites' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div 
      className={`
        h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Header with Logo and Workspace Switcher */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => setIsWorkspaceSwitcherOpen(!isWorkspaceSwitcherOpen)}
                className="flex items-center gap-2 flex-1 hover:bg-gray-50 rounded-lg p-2 -ml-2"
              >
                <div className="flex items-center gap-2 flex-1">
                  <User size={16} className="text-gray-600" />
                  <span className="font-semibold text-sm">My Workspace</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
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
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 hover:bg-white rounded-lg text-sm">
                My Workspace
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-white rounded-lg text-sm text-gray-600">
                + Create workspace
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
              WORKSPACES
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
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'J'}
                </span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold">{user?.name || 'Javian Walker'}</div>
                <div className="text-xs text-gray-500">{user?.email || 'javian@forthlogic.com'}</div>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Credits Display */}
            <div className="mt-2 px-2">
              <div className="text-xs text-gray-500 mb-1">1,250 credits</div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  Pro Plan
                </span>
                <button className="text-xs text-purple-600 hover:text-purple-700 font-semibold">
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
                  onClick={signOut}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg text-red-600"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mx-auto hover:bg-purple-700 transition-colors"
          >
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'J'}
            </span>
          </button>
        )}
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
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

