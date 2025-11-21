import { useState, useRef } from 'react';
import { useSystemSettings, useUploadLogo } from '@/lib/queries';
import { toast } from 'sonner';

export default function LogoUploadSection() {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: settings } = useSystemSettings();
  const uploadLogo = useUploadLogo();
  
  const handleUploadSuccess = () => {
    toast.success('Logo uploaded successfully!');
    setPreview(null);
    setUploading(false);
  };
  
  const handleUploadError = (error: any) => {
    toast.error(error.message || 'Failed to upload logo');
    setUploading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Read file and create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!preview || !fileInputRef.current?.files?.[0]) return;

    setUploading(true);
    const file = fileInputRef.current.files[0];
    
    uploadLogo.mutate({
      base64Image: preview,
      filename: file.name,
    }, {
      onSuccess: handleUploadSuccess,
      onError: handleUploadError,
    });
  };

  const handleCancel = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentLogoUrl = settings?.app_logo_url || '/logo.png';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Application Logo</h3>
      
      <div className="space-y-4">
        {/* Current Logo */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Current Logo</p>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <img
              src={currentLogoUrl}
              alt="Current logo"
              className="h-16 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.src = '/logo.png';
              }}
            />
            <div className="text-sm text-gray-500">
              {currentLogoUrl}
            </div>
          </div>
        </div>

        {/* Upload New Logo */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Upload New Logo</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {preview ? (
            <div className="space-y-3">
              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-16 w-auto object-contain mx-auto"
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={uploading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-gray-600 font-medium"
            >
              Choose Image
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Recommended: PNG or SVG format, transparent background, max 2MB
        </p>
      </div>
    </div>
  );
}

