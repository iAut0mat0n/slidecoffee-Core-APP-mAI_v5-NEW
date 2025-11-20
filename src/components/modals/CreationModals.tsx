import { useState } from 'react';

// Brand Creation Modal
export function BrandCreateModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [name, setName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#7C3AED');
  const [secondaryColor, setSecondaryColor] = useState('#3B82F6');
  const [logo, setLogo] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, primaryColor, secondaryColor, logo });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Create Brand</h2>
          <p className="text-gray-600 mt-1">Define your brand identity</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Acme Inc"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-16 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg"
            >
              Create Brand
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Project Creation Modal
export function ProjectCreateModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, brand });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Create Project</h2>
          <p className="text-gray-600 mt-1">Start a new presentation</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Q4 Sales Deck"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="What's this presentation about?"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a brand...</option>
              <option value="default">Default Brand</option>
              <option value="acme">Acme Inc</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Export Modal
export function ExportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [format, setFormat] = useState('pdf');

  if (!isOpen) return null;

  const handleExport = () => {
    console.log('Exporting as:', format);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Export Presentation</h2>
          <p className="text-gray-600 mt-1">Choose your export format</p>
        </div>

        <div className="p-6 space-y-4">
          {[
            { value: 'pdf', label: 'PDF', icon: '📄', desc: 'Best for sharing and printing' },
            { value: 'pptx', label: 'PowerPoint', icon: '📊', desc: 'Edit in Microsoft PowerPoint' },
            { value: 'gslides', label: 'Google Slides', icon: '📑', desc: 'Open in Google Slides' },
            { value: 'images', label: 'Images (PNG)', icon: '🖼️', desc: 'Individual slide images' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFormat(option.value)}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                format === option.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </div>
                {format === option.value && (
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

// Share Modal
export function ShareModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [shareLink] = useState('https://slidecoffee.com/p/abc123');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Share Presentation</h2>
          <p className="text-gray-600 mt-1">Anyone with the link can view</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
              <button
                onClick={handleCopy}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Share via</div>
            <div className="grid grid-cols-4 gap-3">
              {['Email', 'Slack', 'Teams', 'Twitter'].map((platform) => (
                <button
                  key={platform}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
export function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName, 
  itemType 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  itemName: string;
  itemType: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Delete {itemType}?</h2>
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
          </p>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

