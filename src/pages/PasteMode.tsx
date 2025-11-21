import { useState } from 'react';

export default function PasteMode() {
  const [content, setContent] = useState('');
  const [detectingStructure, setDetectingStructure] = useState(false);

  const handleAnalyze = () => {
    setDetectingStructure(true);
    setTimeout(() => setDetectingStructure(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Paste Content</h1>
          <p className="text-gray-600 mt-1">
            Paste your content and we will automatically structure it into slides
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Your Content</h3>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your content here...&#10;&#10;You can paste:&#10;• Meeting notes&#10;• Articles or blog posts&#10;• Reports or documents&#10;• Bullet points or outlines&#10;&#10;We'll automatically detect headings, sections, and key points to create slides."
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  {content.length} characters • {content.split('\n').filter(line => line.trim()).length} lines
                </div>
                <button
                  onClick={() => setContent('')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={!content.trim() || detectingStructure}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {detectingStructure ? 'Analyzing...' : 'Create Presentation'}
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-white font-medium">
                Cancel
              </button>
            </div>
          </div>

          {/* Tips & Options */}
          <div className="lg:col-span-1 space-y-6">
            {/* Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Options</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Auto-detect headings</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Create title slide</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Add slide numbers</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Smart formatting</span>
                </label>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold mb-3">💡 Tips</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Use # for main headings (slide titles)</li>
                <li>• Use ## for subheadings</li>
                <li>• Bullet points become slide content</li>
                <li>• Empty lines separate sections</li>
                <li>• We'll optimize layout automatically</li>
              </ul>
            </div>

            {/* Example */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-3">Example Format</h3>
              <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto">
{`# Q4 Results

## Revenue Growth
- 25% increase YoY
- $5M total revenue
- 1000+ new customers

## Key Achievements
- Launched new product
- Expanded to 3 markets`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

