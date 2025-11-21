import { useState } from 'react';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentationTitle?: string;
}

export default function ExportOptionsModal({ isOpen, onClose, presentationTitle = 'My Presentation' }: ExportOptionsModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'pptx' | 'images' | 'video'>('pdf');
  const [includeNotes, setIncludeNotes] = useState(false);
  const [quality, setQuality] = useState<'standard' | 'high'>('standard');

  if (!isOpen) return null;

  const formats = [
    { id: 'pdf', name: 'PDF', icon: '📄', description: 'Best for sharing and printing' },
    { id: 'pptx', name: 'PowerPoint', icon: '📊', description: 'Editable in Microsoft PowerPoint' },
    { id: 'images', name: 'Images (PNG)', icon: '🖼️', description: 'Individual slide images' },
    { id: 'video', name: 'Video (MP4)', icon: '🎥', description: 'Animated presentation video' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Export Presentation</h2>
            <p className="text-gray-600 mt-1">{presentationTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Format Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-4">Choose Format</h3>
            <div className="grid grid-cols-2 gap-4">
              {formats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id as typeof selectedFormat)}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    selectedFormat === format.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{format.icon}</div>
                  <div className="font-semibold mb-1">{format.name}</div>
                  <div className="text-sm text-gray-600">{format.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="mb-6">
            <h3 className="font-semibold mb-4">Export Options</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                  className="rounded"
                />
                <div>
                  <div className="font-medium text-sm">Include speaker notes</div>
                  <div className="text-xs text-gray-600">Add notes below each slide</div>
                </div>
              </label>

              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="font-medium text-sm mb-3">Quality</div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setQuality('standard')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      quality === 'standard'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setQuality('high')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      quality === 'high'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    High Quality
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* File Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Estimated file size:</span>
              <span className="font-semibold">
                {quality === 'high' ? '12.5 MB' : '4.2 MB'}
              </span>
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
          <button className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
            Export {formats.find(f => f.id === selectedFormat)?.name}
          </button>
        </div>
      </div>
    </div>
  );
}

