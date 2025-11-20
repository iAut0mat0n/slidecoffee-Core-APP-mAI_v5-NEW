import { useState } from 'react';

export default function TemplateCreator() {
  const [step, setStep] = useState(1);
  const [templateData, setTemplateData] = useState({
    name: '',
    category: '',
    description: '',
    slides: 10,
    style: 'modern',
  });

  const categories = ['Business', 'Marketing', 'Sales', 'Education', 'Creative', 'Technical'];
  const styles = ['Modern', 'Classic', 'Minimal', 'Bold', 'Elegant'];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Template</h1>
          <p className="text-gray-600 mt-1">Build a reusable presentation template</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            {[
              { num: 1, label: 'Basic Info' },
              { num: 2, label: 'Design Style' },
              { num: 3, label: 'Slide Structure' },
              { num: 4, label: 'Review' },
            ].map((s) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s.num
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s.num}
                </div>
                <span className={`ml-2 ${step >= s.num ? 'text-purple-600 font-medium' : 'text-gray-600'}`}>
                  {s.label}
                </span>
                {s.num < 4 && <div className="w-16 h-0.5 bg-gray-200 mx-4"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateData.name}
                  onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                  placeholder="e.g., Modern Business Pitch"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={templateData.category}
                  onChange={(e) => setTemplateData({ ...templateData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={templateData.description}
                  onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe what this template is best used for..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 2: Design Style */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Choose Design Style</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {styles.map((style) => (
                  <div
                    key={style}
                    onClick={() => setTemplateData({ ...templateData, style: style.toLowerCase() })}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      templateData.style === style.toLowerCase()
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-4xl mb-3">🎨</div>
                    <h3 className="font-semibold mb-1">{style}</h3>
                    <p className="text-sm text-gray-600">Perfect for {style.toLowerCase()} presentations</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Slide Structure */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Slide Structure</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Slides
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={templateData.slides}
                  onChange={(e) => setTemplateData({ ...templateData, slides: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-center text-2xl font-bold text-purple-600 mt-2">
                  {templateData.slides} slides
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {['Title Slide', 'Agenda', 'Content', 'Data Visualization', 'Quote', 'Thank You'].map((type) => (
                  <div key={type} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{type}</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Review & Create</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Template Name</div>
                  <div className="font-semibold">{templateData.name || 'Not set'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Category</div>
                  <div className="font-semibold">{templateData.category || 'Not set'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Style</div>
                  <div className="font-semibold capitalize">{templateData.style}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Slides</div>
                  <div className="font-semibold">{templateData.slides} slides</div>
                </div>
              </div>

              <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
                <h3 className="font-semibold mb-2">Ready to create?</h3>
                <p className="text-sm text-gray-700">
                  Your template will be saved and available in the Templates gallery for all team members.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
              >
                Next Step
              </button>
            ) : (
              <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
                Create Template
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

