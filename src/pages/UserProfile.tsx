import { useState } from 'react';

export default function UserProfile() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Profile Photo */}
          <div className="flex items-center gap-6 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
              JD
            </div>
            <div>
              <h3 className="font-semibold mb-2">Profile Photo</h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-sm">
                  Upload New
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  Remove
                </button>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="py-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={254}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
                maxLength={1000}
              />
            </div>
          </div>

          {/* Password */}
          <div className="py-8 border-t border-gray-200 space-y-6">
            <h3 className="font-semibold">Change Password</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                minLength={8}
                maxLength={72}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                minLength={8}
                maxLength={72}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                minLength={8}
                maxLength={72}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 flex gap-3">
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
              Save Changes
            </button>
            <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

