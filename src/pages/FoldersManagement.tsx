import { useState } from 'react';

export default function FoldersManagement() {
  const [folders] = useState([
    { id: 1, name: 'Sales Presentations', count: 12, color: 'purple', icon: '📊' },
    { id: 2, name: 'Marketing Materials', count: 8, color: 'blue', icon: '🎨' },
    { id: 3, name: 'Product Launches', count: 5, color: 'green', icon: '🚀' },
    { id: 4, name: 'Team Updates', count: 15, color: 'orange', icon: '👥' },
    { id: 5, name: 'Client Pitches', count: 7, color: 'red', icon: '💼' },
    { id: 6, name: 'Training Materials', count: 10, color: 'indigo', icon: '📚' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Folders</h1>
            <p className="text-gray-600 mt-1">Organize your presentations</p>
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
            + New Folder
          </button>
        </div>

        {/* Folders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-16 h-16 bg-${folder.color}-100 rounded-lg flex items-center justify-center text-3xl`}>
                  {folder.icon}
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded">
                  ⋮
                </button>
              </div>
              <h3 className="text-lg font-semibold mb-2">{folder.name}</h3>
              <p className="text-sm text-gray-600">{folder.count} presentations</p>
            </div>
          ))}

          {/* Create New Folder Card */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-6 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl mb-4">
              ➕
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Create New Folder</h3>
            <p className="text-sm text-gray-500 mt-1">Organize your work</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-medium mb-1">Search in Folders</div>
              <div className="text-sm text-gray-600">Find presentations quickly</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium mb-1">Move Multiple</div>
              <div className="text-sm text-gray-600">Organize in bulk</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-2xl mb-2">🏷️</div>
              <div className="font-medium mb-1">Manage Tags</div>
              <div className="text-sm text-gray-600">Add labels to folders</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

