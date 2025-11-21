import { useState } from 'react';

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectCreationModal({ isOpen, onClose }: ProjectCreationModalProps) {
  const [projectName, setProjectName] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('default');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');

  const brands = [
    { id: 'default', name: 'Default', color: '#8B5CF6' },
    { id: 'company', name: 'My Company', color: '#3B82F6' },
    { id: 'personal', name: 'Personal', color: '#10B981' },
  ];

  const templates = [
    { id: 'blank', name: 'Blank', description: 'Start from scratch', icon: '📄' },
    { id: 'pitch', name: 'Pitch Deck', description: 'Investor presentation', icon: '💼' },
    { id: 'report', name: 'Report', description: 'Business report', icon: '📊' },
    { id: 'education', name: 'Education', description: 'Teaching materials', icon: '🎓' },
  ];

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Handle project creation
    onClose();
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
              Brand
            </label>
            <div className="grid grid-cols-3 gap-3">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedBrand === brand.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded mb-2"
                    style={{ backgroundColor: brand.color }}
                  ></div>
                  <div className="font-medium text-sm">{brand.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Template
            </label>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{template.icon}</div>
                  <div className="font-medium mb-1">{template.name}</div>
                  <div className="text-sm text-gray-600">{template.description}</div>
                </button>
              ))}
            </div>
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
            disabled={!projectName}
            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

