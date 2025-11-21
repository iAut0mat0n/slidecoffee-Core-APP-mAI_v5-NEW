import { useState } from 'react';

interface BrandCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BrandCreationModal({ isOpen, onClose }: BrandCreationModalProps) {
  const [step, setStep] = useState(1);
  const [brandData, setBrandData] = useState({
    name: '',
    primaryColor: '#8B5CF6',
    secondaryColor: '#3B82F6',
    logo: null as string | null,
  });

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandData({ ...brandData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    // Handle brand creation
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Create New Brand</h2>
            <p className="text-gray-600 mt-1">Step {step} of 2</p>
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
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={brandData.name}
                  onChange={(e) => setBrandData({ ...brandData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="My Company"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Brand Logo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    {brandData.logo ? (
                      <img src={brandData.logo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <span className="text-5xl">🏢</span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="brand-logo-upload"
                    />
                    <label
                      htmlFor="brand-logo-upload"
                      className="inline-block px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer font-medium"
                    >
                      Upload Logo
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      PNG, JPG or SVG (max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Primary Brand Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={brandData.primaryColor}
                    onChange={(e) => setBrandData({ ...brandData, primaryColor: e.target.value })}
                    className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandData.primaryColor}
                    onChange={(e) => setBrandData({ ...brandData, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Secondary Brand Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={brandData.secondaryColor}
                    onChange={(e) => setBrandData({ ...brandData, secondaryColor: e.target.value })}
                    className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandData.secondaryColor}
                    onChange={(e) => setBrandData({ ...brandData, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: brandData.primaryColor }}
                    >
                      {brandData.logo ? (
                        <img src={brandData.logo} alt="Logo" className="w-12 h-12 object-contain" />
                      ) : (
                        <span className="text-3xl">🏢</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{brandData.name || 'Your Brand'}</h3>
                      <p className="text-sm text-gray-600">Sample Presentation</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="w-12 h-12 rounded"
                      style={{ backgroundColor: brandData.primaryColor }}
                    ></div>
                    <div
                      className="w-12 h-12 rounded"
                      style={{ backgroundColor: brandData.secondaryColor }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!brandData.name}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
              >
                Create Brand
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

