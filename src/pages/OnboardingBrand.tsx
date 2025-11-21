import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function OnboardingBrand() {
  const [brandName, setBrandName] = useState('');
  const [brandColor, setBrandColor] = useState('#8B5CF6');
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle brand creation
  };

  const presetColors = [
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#EC4899', // Pink
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎨</div>
          <h1 className="text-4xl font-bold mb-2">Set Up Your Brand</h1>
          <p className="text-gray-600">
            Add your brand colors and logo to make your presentations uniquely yours
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="My Brand"
                required
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Logo (Optional)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  {uploadedLogo ? (
                    <img src={uploadedLogo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <span className="text-4xl">🏢</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
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

            {/* Brand Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-4 mb-3">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                    placeholder="#8B5CF6"
                  />
                </div>
              </div>
              
              {/* Preset Colors */}
              <div className="flex gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBrandColor(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      brandColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: brandColor }}>
                    {uploadedLogo ? (
                      <img src={uploadedLogo} alt="Logo" className="w-12 h-12 object-contain" />
                    ) : (
                      <span className="text-3xl">🏢</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{brandName || 'Your Brand'}</h3>
                    <p className="text-sm text-gray-600">Sample Presentation Title</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Link href="/onboarding/workspace" className="flex-1">
                <button
                  type="button"
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  Complete Setup
                </button>
              </Link>
            </div>

            {/* Skip Option */}
            <div className="text-center">
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                Skip for now
              </Link>
            </div>
          </form>

          {/* Progress */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

