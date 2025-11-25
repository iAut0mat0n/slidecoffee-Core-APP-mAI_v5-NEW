import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Grid3x3, List, Filter, Calendar, Sparkles, Folder, Clock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import CreateBrewWizard from '../components/CreateBrewWizard';
import { useProjects } from '../lib/queries';

export default function Brews() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizard, setShowWizard] = useState(false);

  const handleCreateNew = () => {
    setShowWizard(true);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      {showWizard && <CreateBrewWizard onClose={() => setShowWizard(false)} />}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-600" />
                Brews
              </h1>
              <p className="text-gray-600 mt-1">Create AI-powered presentations with our guided workflow</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Brew
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brews..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filters</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-50 p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredProjects.length === 0 && searchQuery ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No brews found</h3>
              <p className="text-gray-600">Try adjusting your search query</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            // Empty state - first time user
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Brews!</h2>
              <p className="text-lg text-gray-600 mb-8">
                Create stunning AI-powered presentations with our guided workflow.
                <br />
                Let's brew your first presentation together.
              </p>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-lg"
              >
                <Plus className="w-6 h-6" />
                Create Your First Brew
              </button>

              {/* Features List */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
                  <p className="text-sm text-gray-600">
                    Generate outlines and content automatically with advanced AI
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Grid3x3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Beautiful Themes</h3>
                  <p className="text-sm text-gray-600">
                    Choose from 6 professional themes or import your own
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Save Time</h3>
                  <p className="text-sm text-gray-600">
                    Create presentations 10x faster with our guided workflow
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Project Grid View
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewMode={viewMode}
                  onClick={() => navigate(`/projects/${project.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Project Card Component
function ProjectCard({ project, viewMode, onClick }: { 
  project: any; 
  viewMode: 'grid' | 'list';
  onClick: () => void;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (viewMode === 'list') {
    return (
      <button
        onClick={onClick}
        className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left flex items-center gap-4"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex-shrink-0 flex items-center justify-center">
          <Folder className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
          <p className="text-sm text-gray-600 truncate">{project.description || 'No description'}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          {formatDate(project.updated_at || project.created_at)}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 text-left group"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center relative overflow-hidden">
        <Sparkles className="w-16 h-16 text-white opacity-50 group-hover:scale-110 transition-transform" />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{project.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {project.description || 'No description'}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(project.updated_at || project.created_at)}
          </div>
          <div className="flex items-center gap-1">
            <Folder className="w-3 h-3" />
            Project
          </div>
        </div>
      </div>
    </button>
  );
}
