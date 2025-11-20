import { useState } from 'react'
import { Plus, Search, Grid3x3, List } from 'lucide-react'
import CollapsibleSidebar from '../components/CollapsibleSidebar'

interface Theme {
  id: string
  name: string
  subtitle?: string
  backgroundColor: string
  textColor: string
  creator: string
  timestamp: string
  isCustom: boolean
}

type FilterTab = 'custom' | 'standard' | 'archived'
type ViewMode = 'grid' | 'list'

export default function ThemesNew() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('custom')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showImportModal, setShowImportModal] = useState(false)

  const themes: Theme[] = [
    {
      id: '1',
      name: 'Orange Technology',
      backgroundColor: '#FFA726',
      textColor: '#FFFFFF',
      creator: 'Created by you',
      timestamp: '2 hours ago',
      isCustom: true,
    },
    {
      id: '2',
      name: 'Blink Studio',
      backgroundColor: '#FFE4E1',
      textColor: '#000000',
      creator: 'Created by you',
      timestamp: '1 day ago',
      isCustom: true,
    },
    {
      id: '3',
      name: 'Dark Teal',
      backgroundColor: '#2F5D62',
      textColor: '#FFFFFF',
      creator: 'Standard',
      timestamp: '6 days',
      isCustom: false,
    },
    {
      id: '4',
      name: 'Retro Waves',
      subtitle: 'Retro Waves',
      backgroundColor: '#F5F5DC',
      textColor: '#2F5D62',
      creator: 'Standard',
      timestamp: '8 days ago',
      isCustom: false,
    },
    {
      id: '5',
      name: 'Classic Blue',
      backgroundColor: '#4A90E2',
      textColor: '#FFFFFF',
      creator: 'Created by you',
      timestamp: '2 days ago',
      isCustom: true,
    },
    {
      id: '6',
      name: 'Purple Modern',
      backgroundColor: '#E6D5F5',
      textColor: '#6B46C1',
      creator: 'Created by you',
      timestamp: '5 hours ago',
      isCustom: true,
    },
    {
      id: '7',
      name: 'Fresh Green',
      backgroundColor: '#C8E6C9',
      textColor: '#2E7D32',
      creator: 'Standard',
      timestamp: '7 days ago',
      isCustom: false,
    },
    {
      id: '8',
      name: 'Lavender Simple',
      subtitle: 'Vibrant Yellow',
      backgroundColor: '#FFF59D',
      textColor: '#000000',
      creator: 'Created by you',
      timestamp: '3 days ago',
      isCustom: true,
    },
    {
      id: '9',
      name: 'Vibrant Yellow',
      subtitle: 'Slate Gray',
      backgroundColor: '#FFF176',
      textColor: '#000000',
      creator: 'Created by you',
      timestamp: '3 days ago',
      isCustom: true,
    },
    {
      id: '10',
      name: 'Minimal Red',
      backgroundColor: '#FFEBEE',
      textColor: '#D32F2F',
      creator: 'Standard',
      timestamp: '1 month ago',
      isCustom: false,
    },
    {
      id: '11',
      name: 'Aqua Geometric',
      backgroundColor: '#F5F5F5',
      textColor: '#000000',
      creator: 'Standard',
      timestamp: '1 month ago',
      isCustom: false,
    },
    {
      id: '12',
      name: 'Onetorit',
      subtitle: 'Aqua Geometric',
      backgroundColor: '#80DEEA',
      textColor: '#000000',
      creator: 'Standard',
      timestamp: '1 month ago',
      isCustom: false,
    },
  ]

  const filterTabs = [
    { id: 'custom', label: 'Custom' },
    { id: 'standard', label: 'Standard' },
    { id: 'archived', label: 'Archived' },
  ] as const

  const filteredThemes = themes.filter(theme => {
    if (activeFilter === 'custom') return theme.isCustom
    if (activeFilter === 'standard') return !theme.isCustom
    return false // archived
  })

  const handleNewTheme = () => {
    console.log('Create new theme')
  }

  const handleImportTheme = () => {
    setShowImportModal(true)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CollapsibleSidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold">Themes</h1>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search themes"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                />
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <List size={18} className={viewMode === 'list' ? 'text-gray-900' : 'text-gray-500'} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <Grid3x3 size={18} className={viewMode === 'grid' ? 'text-gray-900' : 'text-gray-500'} />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleNewTheme}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              New theme
            </button>
            <button
              onClick={handleImportTheme}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Import theme
            </button>
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

          {/* Themes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredThemes.map((theme) => (
              <div
                key={theme.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Theme Preview */}
                <div
                  className="aspect-video flex items-center justify-center p-6"
                  style={{ backgroundColor: theme.backgroundColor }}
                >
                  <div className="text-center">
                    <h3
                      className="text-2xl font-bold mb-1"
                      style={{ color: theme.textColor }}
                    >
                      {theme.subtitle || theme.name.split(' ')[0]}
                    </h3>
                    {theme.subtitle && (
                      <p
                        className="text-lg"
                        style={{ color: theme.textColor, opacity: 0.8 }}
                      >
                        {theme.name.split(' ').slice(1).join(' ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Theme Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{theme.name}</h4>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{theme.creator}</span>
                    <span>{theme.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Import Theme Modal (placeholder) */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Import Theme</h2>
            <p className="text-gray-600 mb-6">Upload a theme file or paste theme JSON</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
              <p className="text-gray-500">Drag and drop theme file here</p>
              <p className="text-sm text-gray-400 mt-2">or click to browse</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

