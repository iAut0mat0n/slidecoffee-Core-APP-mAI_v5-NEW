import { useState } from 'react';

export default function ImportMode() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0].name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Import Presentation</h1>
          <p className="text-gray-600 mt-1">
            Upload your existing presentation to enhance with AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div className="lg:col-span-2">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`bg-white rounded-xl shadow-sm border-2 border-dashed p-12 text-center transition-all ${
                dragActive
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400'
              }`}
            >
              {!uploadedFile ? (
                <>
                  <div className="text-6xl mb-4">📁</div>
                  <h3 className="text-xl font-semibold mb-2">Drop your file here</h3>
                  <p className="text-gray-600 mb-6">or click to browse</p>
                  <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
                    Choose File
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    Supported formats: PPT, PPTX, PDF, KEY, GOOGLE SLIDES
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold mb-2">File uploaded!</h3>
                  <p className="text-gray-600 mb-6">{uploadedFile}</p>
                  <div className="flex gap-3 justify-center">
                    <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
                      Start Import
                    </button>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-white font-medium"
                    >
                      Change File
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Import Options */}
            {uploadedFile && (
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold mb-4">Import Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Preserve original formatting</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Import animations</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Import speaker notes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Apply brand guidelines after import</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Supported Formats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Supported Formats</h3>
              <div className="space-y-3">
                {[
                  { format: 'PowerPoint', ext: '.ppt, .pptx', icon: '📊' },
                  { format: 'PDF', ext: '.pdf', icon: '📄' },
                  { format: 'Keynote', ext: '.key', icon: '🎨' },
                  { format: 'Google Slides', ext: 'URL import', icon: '📑' },
                ].map((item) => (
                  <div key={item.format} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{item.format}</div>
                      <div className="text-xs text-gray-600">{item.ext}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What Happens Next */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold mb-3">What happens next?</h3>
              <ol className="text-sm text-gray-700 space-y-2">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>We'll analyze your slides</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Extract content and structure</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Optimize for SlideCoffee</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">4.</span>
                  <span>You can edit and enhance</span>
                </li>
              </ol>
            </div>

            {/* File Size Limit */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-2">File Size Limit</h3>
              <p className="text-sm text-gray-600 mb-3">
                Maximum file size: <span className="font-semibold">50 MB</span>
              </p>
              <p className="text-xs text-gray-500">
                Need to upload larger files? Contact support for enterprise options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

