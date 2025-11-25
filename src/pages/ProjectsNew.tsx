import { useState } from 'react'
import { Search, Plus, Star, Image as ImageIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CollapsibleSidebar from '../components/CollapsibleSidebar'
import ProjectCreationModal from '../components/ProjectCreationModal'
import { useProjects } from '../lib/queries'
import { formatDistanceToNow } from 'date-fns'

type FilterTab = 'all' | 'recent' | 'created' | 'favorites'

export default function ProjectsNew() {
  const navigate = useNavigate()
  const { data: projectsData, isLoading } = useProjects()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'recent', label: 'Recently viewed' },
    { id: 'created', label: 'Created by you' },
    { id: 'favorites', label: 'Favorites' },
  ] as const

  const projects = projectsData || []

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true
    
    if (activeFilter === 'favorites') {
      return matchesSearch && project.is_favorite
    }
    
    return matchesSearch
  })

  const handleCreateNew = () => {
    setShowCreateModal(true)
  }

  const handleProjectCreated = (project: any) => {
    console.log('🚀 Project created, navigating to slide generation with project:', project);
    // Navigate to slide generation with project context
    navigate('/create/generate', { 
      state: { 
        projectId: project.id,
        projectName: project.name,
        brandId: project.brand_id 
      } 
    });
  }

  const handleProjectClick = (projectId: string) => {
    navigate(`/editor/${projectId}`)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CollapsibleSidebar />
      
      {/* Project Creation Modal */}
      <ProjectCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleProjectCreated}
      />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Projects</h1>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                />
              </div>
              
              {/* Create Button */}
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={20} />
                Create new
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-6 mb-6 border-b border-gray-200">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`
                  pb-3 font-medium transition-colors relative
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

          {/* Projects Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading projects...</div>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const slideCount = project.slides?.length || 0
                const lastEdited = project.updated_at 
                  ? `Last edited ${formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}`
                  : 'Recently created'

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div
                      onClick={() => handleProjectClick(project.id)}
                      className="aspect-video bg-gradient-to-br from-purple-600 to-purple-700 relative flex items-center justify-center"
                    >
                      <div className="w-16 h-12 bg-purple-500 bg-opacity-50 rounded"></div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{project.name || 'Untitled Project'}</h3>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Star
                            size={20}
                            className={project.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}
                          />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{slideCount} slides</p>
                      <p className="text-sm text-gray-500">{lastEdited}</p>
                    </div>
                  </div>
                )
              })}

              {/* Empty State Card */}
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden flex flex-col items-center justify-center aspect-[4/3] hover:border-purple-400 transition-colors">
                <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-gray-500">No projects</p>
              </div>
            </div>
          ) : (
            // Empty State
            <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center justify-center">
              <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6">Create your first project to get started</p>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus size={20} />
                Create Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

