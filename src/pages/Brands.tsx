import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowLeft, Palette, Trash2, Edit } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type Brand, type Workspace } from '../lib/supabase'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'

export default function Brands() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [brands, setBrands] = useState<Brand[]>([])
  const [, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    primary_color: '#7C3AED',
    secondary_color: '#6EE7B7',
    accent_color: '#FFE5E5',
    font_heading: 'Inter',
    font_body: 'Inter',
    guidelines: ''
  })

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Load workspaces
      const { data: workspacesData } = await supabase
        .from('v2_workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
      
      if (workspacesData && workspacesData.length > 0) {
        setWorkspaces(workspacesData)
        setCurrentWorkspace(workspacesData[0])
        
        // Load brands
        const { data: brandsData } = await supabase
          .from('v2_brands')
          .select('*')
          .eq('workspace_id', workspacesData[0].id)
          .order('created_at', { ascending: false })
        
        setBrands(brandsData || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentWorkspace) return
    
    try {
      if (editingBrand) {
        // Update existing brand
        const { error } = await supabase
          .from('v2_brands')
          .update(formData)
          .eq('id', editingBrand.id)
        
        if (error) throw error
      } else {
        // Create new brand
        const { error } = await supabase
          .from('v2_brands')
          .insert({
            ...formData,
            workspace_id: currentWorkspace.id
          })
        
        if (error) throw error
      }
      
      // Reset form
      setFormData({
        name: '',
        primary_color: '#7C3AED',
        secondary_color: '#6EE7B7',
        accent_color: '#FFE5E5',
        font_heading: 'Inter',
        font_body: 'Inter',
        guidelines: ''
      })
      setShowCreateForm(false)
      setEditingBrand(null)
      loadData()
    } catch (error) {
      console.error('Error saving brand:', error)
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name,
      primary_color: brand.primary_color,
      secondary_color: brand.secondary_color,
      accent_color: brand.accent_color,
      font_heading: brand.font_heading,
      font_body: brand.font_body,
      guidelines: brand.guidelines || ''
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return
    
    try {
      const { error } = await supabase
        .from('v2_brands')
        .delete()
        .eq('id', brandId)
      
      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Error deleting brand:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Brand Guidelines</h1>
              <p className="text-gray-600">Manage your brand identities</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingBrand(null)
              setFormData({
                name: '',
                primary_color: '#7C3AED',
                secondary_color: '#6EE7B7',
                accent_color: '#FFE5E5',
                font_heading: 'Inter',
                font_body: 'Inter',
                guidelines: ''
              })
              setShowCreateForm(true)
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Brand
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        {showCreateForm ? (
          <Card className="p-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingBrand ? 'Edit Brand' : 'Create New Brand'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Brand Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Company Brand"
                required
              />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heading Font
                  </label>
                  <select
                    value={formData.font_heading}
                    onChange={(e) => setFormData({ ...formData, font_heading: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Playfair Display">Playfair Display</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Font
                  </label>
                  <select
                    value={formData.font_body}
                    onChange={(e) => setFormData({ ...formData, font_body: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Guidelines (Optional)
                </label>
                <textarea
                  value={formData.guidelines}
                  onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                  placeholder="Add any additional brand guidelines, tone of voice, or style notes..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingBrand(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingBrand ? 'Update Brand' : 'Create Brand'}
                </Button>
              </div>
            </form>
          </Card>
        ) : brands.length === 0 ? (
          <Card className="p-12 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No brands yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first brand to maintain consistent styling across presentations
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Brand
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Card key={brand.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg">{brand.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(brand)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-2">Colors</div>
                    <div className="flex gap-2">
                      <div
                        className="w-12 h-12 rounded-lg shadow-sm"
                        style={{ backgroundColor: brand.primary_color }}
                        title={brand.primary_color}
                      />
                      <div
                        className="w-12 h-12 rounded-lg shadow-sm"
                        style={{ backgroundColor: brand.secondary_color }}
                        title={brand.secondary_color}
                      />
                      <div
                        className="w-12 h-12 rounded-lg shadow-sm"
                        style={{ backgroundColor: brand.accent_color }}
                        title={brand.accent_color}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Fonts</div>
                    <div className="text-sm text-gray-700">
                      <div>Heading: {brand.font_heading}</div>
                      <div>Body: {brand.font_body}</div>
                    </div>
                  </div>

                  {brand.guidelines && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Guidelines</div>
                      <p className="text-sm text-gray-700 line-clamp-2">{brand.guidelines}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

