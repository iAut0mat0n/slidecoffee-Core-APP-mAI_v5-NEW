import { useState } from 'react'
import { Plus, Coffee } from 'lucide-react'
import CollapsibleSidebar from '../components/CollapsibleSidebar'

interface Brand {
  id: string
  name: string
  font: string
  colors: string[]
  logo?: string
}

export default function BrandsNew() {
  const [brands, setBrands] = useState<Brand[]>([
    {
      id: '1',
      name: 'Apple',
      font: 'Helvetic Neue',
      colors: ['#000000', '#6B7280', '#F3F4F6'],
      logo: '🍎',
    },
    {
      id: '2',
      name: 'Google',
      font: 'Roboto',
      colors: ['#EA4335', '#34A853', '#4285F4', '#000000'],
      logo: '🔍',
    },
    {
      id: '3',
      name: 'Shopify',
      font: 'Graphik',
      colors: ['#96BF48', '#008060', '#1A1A1A'],
      logo: '🛍️',
    },
    {
      id: '4',
      name: 'Amazon',
      font: 'Amazon Ember',
      colors: ['#000000', '#FF9900', '#9CA3AF'],
      logo: '📦',
    },
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreateBrand = () => {
    setShowCreateModal(true)
  }

  const handleEdit = (brandId: string) => {
    console.log('Edit brand:', brandId)
  }

  const handleDelete = (brandId: string) => {
    setBrands(brands.filter(b => b.id !== brandId))
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CollapsibleSidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Brands</h1>
            <button
              onClick={handleCreateBrand}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              Create Brand
            </button>
          </div>

          {/* Brands Grid */}
          {brands.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {/* Logo */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                        {brand.logo}
                      </div>
                      
                      {/* Brand Info */}
                      <div>
                        <h3 className="text-xl font-bold mb-1">{brand.name}</h3>
                        <p className="text-gray-600">{brand.font}</p>
                      </div>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="flex items-center gap-3 mb-4">
                    {brand.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-10 h-10 rounded-full border-2 border-gray-200"
                        style={{ backgroundColor: color }}
                        title={color}
                      ></div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(brand.id)}
                      className="flex-1 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id)}
                      className="flex-1 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {/* Empty State Card */}
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center min-h-[200px] hover:border-purple-400 transition-colors">
                <Coffee className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-center">No brands yet</p>
              </div>
            </div>
          ) : (
            // Empty State
            <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center justify-center">
              <Coffee className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No brands yet</h3>
              <p className="text-gray-500 mb-6">Create your first brand to get started</p>
              <button
                onClick={handleCreateBrand}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus size={20} />
                Create Brand
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Brand Modal (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create Brand</h2>
            <p className="text-gray-600 mb-6">Brand creation form will go here</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

