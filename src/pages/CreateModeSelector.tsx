import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, FileText, Upload, Coffee } from 'lucide-react'

type CreateMode = 'generate' | 'paste' | 'import' | 'template' | null

export default function CreateModeSelector() {
  const navigate = useNavigate()
  const [selectedMode, setSelectedMode] = useState<CreateMode>('generate')

  const handleContinue = () => {
    if (selectedMode === 'generate') {
      navigate('/create/generate')
    } else if (selectedMode === 'paste') {
      navigate('/create/paste')
    } else if (selectedMode === 'import') {
      navigate('/create/import')
    } else if (selectedMode === 'template') {
      navigate('/templates')
    }
  }

  const handleSkip = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-full"></div>
          <span className="text-xl font-bold">SlideCoffee</span>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <span className="text-gray-400 ml-2">4</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-5xl w-full">
          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Create your first BREW</h1>
            <p className="text-xl text-gray-600">How would you like to get started?</p>
          </div>

          {/* Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Generate with AI */}
            <button
              onClick={() => setSelectedMode('generate')}
              className={`
                relative p-8 rounded-2xl text-left transition-all
                ${selectedMode === 'generate'
                  ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-xl scale-105'
                  : 'bg-white text-gray-900 hover:shadow-lg'
                }
              `}
            >
              {selectedMode === 'generate' && (
                <div className="absolute top-4 right-4 bg-white text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                  RECOMMENDED
                </div>
              )}
              <Sparkles className={`w-12 h-12 mb-4 ${selectedMode === 'generate' ? 'text-white' : 'text-purple-600'}`} />
              <h3 className="text-2xl font-bold mb-2">Generate with AI</h3>
              <p className={selectedMode === 'generate' ? 'text-purple-100' : 'text-gray-600'}>
                Create from a prompt in seconds
              </p>
            </button>

            {/* Paste Content */}
            <button
              onClick={() => setSelectedMode('paste')}
              className={`
                p-8 rounded-2xl text-left transition-all
                ${selectedMode === 'paste'
                  ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-gray-900 shadow-xl scale-105'
                  : 'bg-white text-gray-900 hover:shadow-lg'
                }
              `}
            >
              <FileText className={`w-12 h-12 mb-4 ${selectedMode === 'paste' ? 'text-gray-700' : 'text-gray-400'}`} />
              <h3 className="text-2xl font-bold mb-2">Paste content</h3>
              <p className="text-gray-600">
                Create from notes or outline
              </p>
            </button>

            {/* Import File */}
            <button
              onClick={() => setSelectedMode('import')}
              className={`
                p-8 rounded-2xl text-left transition-all
                ${selectedMode === 'import'
                  ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-xl scale-105'
                  : 'bg-white text-gray-900 hover:shadow-lg'
                }
              `}
            >
              <Upload className={`w-12 h-12 mb-4 ${selectedMode === 'import' ? 'text-white' : 'text-blue-500'}`} />
              <h3 className="text-2xl font-bold mb-2">Import file or URL</h3>
              <p className={selectedMode === 'import' ? 'text-blue-100' : 'text-gray-600'}>
                Enhance existing docs or presentations
              </p>
            </button>
          </div>

          {/* Template Option */}
          <button
            onClick={() => setSelectedMode('template')}
            className={`
              w-full p-6 rounded-2xl text-left transition-all flex items-center gap-4
              ${selectedMode === 'template'
                ? 'bg-purple-50 border-2 border-purple-600'
                : 'bg-white border-2 border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <Coffee className={`w-10 h-10 ${selectedMode === 'template' ? 'text-purple-600' : 'text-gray-400'}`} />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">
                Use template <span className="text-sm font-normal text-gray-500">(BETA)</span>
              </h3>
              <p className="text-gray-600">Fill in structured content templates</p>
            </div>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 mt-12">
            <button
              onClick={handleSkip}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedMode}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

