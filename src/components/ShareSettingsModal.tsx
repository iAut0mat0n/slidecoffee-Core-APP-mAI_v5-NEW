import { useState } from 'react';

interface ShareSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentationTitle?: string;
}

export default function ShareSettingsModal({ isOpen, onClose, presentationTitle = 'My Presentation' }: ShareSettingsModalProps) {
  const [shareLink] = useState('https://slidecoffee.com/p/abc123xyz');
  const [accessLevel, setAccessLevel] = useState<'view' | 'comment' | 'edit'>('view');
  const [requirePassword, setRequirePassword] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Share Presentation</h2>
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
          {/* Share Link */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Share Link</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Access Level */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Access Level</h3>
            <div className="space-y-2">
              {[
                { id: 'view', label: 'Can view', description: 'Viewers can only see the presentation' },
                { id: 'comment', label: 'Can comment', description: 'Viewers can add comments and suggestions' },
                { id: 'edit', label: 'Can edit', description: 'Editors can make changes to the presentation' },
              ].map((level) => (
                <label
                  key={level.id}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    accessLevel === level.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="accessLevel"
                    checked={accessLevel === level.id}
                    onChange={() => setAccessLevel(level.id as typeof accessLevel)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">{level.label}</div>
                    <div className="text-sm text-gray-600">{level.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Additional Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requirePassword}
                  onChange={(e) => setRequirePassword(e.target.checked)}
                  className="rounded"
                />
                <div>
                  <div className="font-medium text-sm">Require password</div>
                  <div className="text-xs text-gray-600">Viewers must enter a password to access</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="rounded"
                />
                <div>
                  <div className="font-medium text-sm">Allow download</div>
                  <div className="text-xs text-gray-600">Let viewers download a copy</div>
                </div>
              </label>
            </div>
          </div>

          {/* Embed Code */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Embed Code</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              {`<iframe src="${shareLink}/embed" width="800" height="600" frameborder="0"></iframe>`}
            </div>
            <button className="mt-2 text-sm text-purple-600 hover:text-purple-700">
              Copy embed code
            </button>
          </div>

          {/* Social Share */}
          <div>
            <h3 className="font-semibold mb-3">Share on Social Media</h3>
            <div className="flex gap-3">
              {[
                { name: 'Twitter', icon: '🐦', color: 'bg-blue-400' },
                { name: 'LinkedIn', icon: '💼', color: 'bg-blue-600' },
                { name: 'Facebook', icon: '📘', color: 'bg-blue-700' },
                { name: 'Email', icon: '✉️', color: 'bg-gray-600' },
              ].map((platform) => (
                <button
                  key={platform.name}
                  className={`flex-1 px-4 py-3 ${platform.color} hover:opacity-90 text-white font-medium rounded-lg flex items-center justify-center gap-2`}
                >
                  <span>{platform.icon}</span>
                  <span className="hidden sm:inline">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

