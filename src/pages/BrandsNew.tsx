import { useState } from 'react'
import { Plus, Coffee } from 'lucide-react'
import CollapsibleSidebar from '../components/CollapsibleSidebar'
import { useBrands, useDeleteBrand } from '../lib/queries'
import BrandCreationModal from '../components/BrandCreationModal'
import { toast } from 'sonner'

export default function BrandsNew() {
  const { data: brands, isLoading } = useBrands()
  const deleteBrand = useDeleteBrand()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)

  const handleCreateBrand = () => {
    setSelectedBrandId(null)
    setShowCreateModal(true)
  }

  const handleEdit = (brandId: string) => {
    setSelectedBrandId(brandId)
    setShowCreateModal(true)
  }

  const handleDelete = async (brandId: string) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      try {
        await deleteBrand.mutateAsync(brandId)
        toast.success('Brand deleted successfully')
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete brand')
      }
    }
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setSelectedBrandId(null)
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

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : brands && brands.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brands.map((brand: any) => (
                <div
                  key={brand.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {/* Logo */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {brand.logo_url ? (
                          <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">🏢</span>
                        )}
                      </div>
                      
                      {/* Brand Info */}
                      <div>
                        <h3 className="text-xl font-bold mb-1">{brand.name}</h3>
                        <p className="text-gray-600 text-sm">{brand.font_heading || brand.font_body || 'Default Font'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="flex items-center gap-3 mb-4">
                    {[brand.primary_color, brand.secondary_color, brand.accent_color].filter(Boolean).map((color, index) => (
                      <div
                        key={index}
                        className="w-10 h-10 rounded-full border-2 border-gray-200"
                        style={{ backgroundColor: color || '#8B5CF6' }}
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
                      disabled={deleteBrand.isPending}
                    >
                      {deleteBrand.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
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

      {/* Create/Edit Brand Modal */}
      <BrandCreationModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        brandId={selectedBrandId}
      />
    </div>
  )
}

