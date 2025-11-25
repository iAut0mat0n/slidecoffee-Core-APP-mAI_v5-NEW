import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Grid3x3, List, Bell, Coffee } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type Presentation } from '../lib/supabase'
import CollapsibleSidebar from '../components/CollapsibleSidebar'

type FilterTab = 'all' | 'recent' | 'created' | 'favorites'
type ViewMode = 'grid' | 'list'

export default function DashboardNew() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadPresentations()
  }, [user])

  const loadPresentations = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Get user's workspaces
      const { data: workspaces } = await supabase
        .from('v2_workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)
      
      if (workspaces && workspaces.length > 0) {
        // Get projects in this workspace
        const { data: projects } = await supabase
          .from('v2_projects')
          .select('id')
          .eq('workspace_id', workspaces[0].id)
        
        if (projects && projects.length > 0) {
          const projectIds = projects.map(p => p.id)
          
          // Load presentations for these projects
          const { data } = await supabase
            .from('v2_presentations')
            .select('*, v2_projects(name, v2_brands(name))')
            .in('project_id', projectIds)
            .order('updated_at', { ascending: false })
          
          setPresentations(data || [])
        }
      }
    } catch (error) {
      console.error('Error loading presentations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    navigate('/create/generate')
  }

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'recent', label: 'Recently viewed' },
    { id: 'created', label: 'Created by you' },
    { id: 'favorites', label: 'Favorites' },
  ] as const

  // Placeholder coffee image for demo
  const coffeeImage = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop'

  return (
    <div className="flex h-screen bg-gray-50">
      <CollapsibleSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={20} />
                Create new
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={20} className="text-gray-600" />
              </button>
              <button className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=7C3AED&color=fff`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Filter Tabs and View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`
                      pb-2 font-medium transition-colors relative
                      ${activeFilter === tab.id 
                        ? 'text-purple-600' 
                        : 'text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    {tab.label}
                    {activeFilter === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <Grid3x3 size={18} className={viewMode === 'grid' ? 'text-gray-900' : 'text-gray-500'} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <List size={18} className={viewMode === 'list' ? 'text-gray-900' : 'text-gray-500'} />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">Loading your brews...</div>
              </div>
            )}

            {/* Empty State */}
            {!loading && presentations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center relative">
                    <Coffee className="w-12 h-12 text-purple-600" />
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-600 rounded-full"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-400 rounded-full"></div>
                    <div className="absolute top-0 right-8 w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold mb-3">No presentations yet</h2>
                <p className="text-gray-600 mb-8 text-center max-w-md">
                  Time for a fresh brew! Get started by creating your first presentation with AI
                </p>
                
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Plus size={20} />
                  Create your first presentation
                </button>
              </div>
            )}

            {/* Projects Grid */}
            {!loading && presentations.length > 0 && (
              <div className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                  : 'space-y-4'
                }
              `}>
                {presentations.map((presentation) => (
                  <div
                    key={presentation.id}
                    onClick={() => navigate(`/editor/${presentation.id}`)}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    {/* Coffee Image Thumbnail */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-amber-900 to-amber-700 relative overflow-hidden">
                      <img
                        src={coffeeImage}
                        alt="BREW"
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl tracking-wider">
                          BREW
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {presentation.title || 'Untitled Presentation'}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {(presentation.v2_projects as any)?.name || 'No project'}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                        <span>
                          {new Date(presentation.updated_at).toLocaleDateString()}
                        </span>
                        <span>{presentation.slide_count || 0} slides</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Placeholder cards for demo */}
                {presentations.length < 8 && Array.from({ length: 8 - presentations.length }).map((_, i) => (
                  <div
                    key={`placeholder-${i}`}
                    onClick={handleCreateNew}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-amber-900 to-amber-700 relative overflow-hidden">
                      <img
                        src={coffeeImage}
                        alt="BREW"
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl tracking-wider">
                          BREW
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">BREW</h3>
                      <p className="text-sm text-gray-500">Sample Project</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                        <span>Today</span>
                        <span>8 slides</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

