import { useState } from 'react'
import { Plus, Coffee, FileText, CheckSquare, Edit3, X } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'

export default function TemplatesNew() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreateTemplate = () => {
    setShowCreateModal(true)
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
            <p className="text-gray-600">Create reusable templates from your presentations</p>
          </div>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
            BETA
          </span>
        </div>

        <div className="max-w-3xl mx-auto text-center py-16">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 border-4 border-gray-300 rounded-full flex items-center justify-center relative bg-gray-50">
              <Coffee className="w-16 h-16 text-gray-400" />
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4">Create your first template</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Turn any BREW into a reusable template for fast, consistent outputs
          </p>

          <button
            onClick={handleCreateTemplate}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors mb-16"
          >
            <Plus size={24} />
            Create template
          </button>

          <div className="border-t border-gray-200 mb-12"></div>

          <h3 className="text-2xl font-bold mb-8">How templates work</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Choose a BREW</h4>
              <p className="text-gray-600">
                Select any existing presentation to use as a template
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <CheckSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Mark reusable sections</h4>
              <p className="text-gray-600">
                Tag which parts should be filled in for each new use
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <Edit3 className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Fill in and generate</h4>
              <p className="text-gray-600">
                Provide new content and let AI adapt the template
              </p>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create Template</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Choose a presentation to turn into a template
            </p>
            <div className="space-y-3 mb-6">
              <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500">
                No presentations available
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
