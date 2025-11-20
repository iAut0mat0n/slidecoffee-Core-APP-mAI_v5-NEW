import { useState } from 'react'
import { Plus, Coffee, FileText, CheckSquare, Edit3 } from 'lucide-react'
import CollapsibleSidebar from '../components/CollapsibleSidebar'

export default function TemplatesNew() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreateTemplate = () => {
    setShowCreateModal(true)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CollapsibleSidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Beta Badge */}
          <div className="flex justify-end mb-4">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
              BETA
            </span>
          </div>

          {/* Empty State */}
          <div className="max-w-3xl mx-auto text-center py-16">
            {/* Coffee Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 border-4 border-gray-300 rounded-full flex items-center justify-center relative">
                <Coffee className="w-16 h-16 text-gray-400" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-2" />
                </div>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold mb-4">Create your first template</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Turn any BREW into a reusable template for fast, consistent outputs
            </p>

            {/* CTA Button */}
            <button
              onClick={handleCreateTemplate}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors mb-16"
            >
              <Plus size={24} />
              Create template
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-12"></div>

            {/* How it works */}
            <h2 className="text-3xl font-bold mb-8">How templates work</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Step 1 */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Choose a BREW</h3>
                <p className="text-gray-600">
                  Select any existing presentation to use as a template
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckSquare className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Mark reusable sections</h3>
                <p className="text-gray-600">
                  Tag which parts should be filled in for each new use
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Edit3 className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fill in and generate</h3>
                <p className="text-gray-600">
                  Provide new content and let AI adapt the template
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Template Modal (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create Template</h2>
            <p className="text-gray-600 mb-6">
              Choose a presentation to turn into a template
            </p>
            <div className="space-y-3 mb-6">
              <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors">
                <div className="font-medium">Market Analysis Q1</div>
                <div className="text-sm text-gray-500">8 slides</div>
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors">
                <div className="font-medium">Product Launch Deck</div>
                <div className="text-sm text-gray-500">12 slides</div>
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors">
                <div className="font-medium">Sales Pitch</div>
                <div className="text-sm text-gray-500">6 slides</div>
              </button>
            </div>
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
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

