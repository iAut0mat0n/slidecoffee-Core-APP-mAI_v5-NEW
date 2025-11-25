import { useState } from 'react';
import { useBrands, useCreateProject } from '../lib/queries';
import { toast } from 'sonner';

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: any) => void;
}

export default function ProjectCreationModal({ isOpen, onClose, onSuccess }: ProjectCreationModalProps) {
  const [projectName, setProjectName] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const { data: brandsData } = useBrands();
  const createProject = useCreateProject();
  
  const brands = brandsData || [];

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('🎯 Creating project:', { name: projectName, brand: selectedBrand || null });
      
      // Hook guarantees clean project object with ID
      const project = await createProject.mutateAsync({
        name: projectName.trim(),
        description: '',
        brand_id: selectedBrand || null,
      });
      
      console.log('✅ Project created:', { id: project.id, name: project.name, brand_id: project.brand_id });
      toast.success('Project created successfully!');
      
      // Reset form
      setProjectName('');
      setSelectedBrand('');
      
      // Pass clean project to success callback
      onSuccess(project);
      
      // Close modal
      onClose();
    } catch (error: any) {
      console.error('❌ Project creation error:', error);
      toast.error(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Create New Project</h2>
            <p className="text-gray-600 mt-1">Start a new presentation</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Q4 Sales Presentation"
              required
              autoFocus
            />
          </div>

          {/* Brand Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Brand (Optional)
            </label>
            {brands.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => setSelectedBrand(brand.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedBrand === brand.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded mb-2"
                      style={{ backgroundColor: brand.primary_color || '#8B5CF6' }}
                    ></div>
                    <div className="font-medium text-sm">{brand.name}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm bg-gray-50 rounded-lg p-4">
                No brands yet. You can create a brand from the Brands page.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!projectName || loading}
            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

