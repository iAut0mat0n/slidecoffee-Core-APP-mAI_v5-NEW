export default function VersionHistory() {
  const versions = [
    {
      id: 1,
      version: 'v1.5',
      author: 'John Doe',
      timestamp: '2024-01-15 10:30 AM',
      changes: 'Updated revenue projections and added Q4 data',
      current: true,
    },
    {
      id: 2,
      version: 'v1.4',
      author: 'Jane Smith',
      timestamp: '2024-01-14 3:45 PM',
      changes: 'Revised color scheme to match brand guidelines',
      current: false,
    },
    {
      id: 3,
      version: 'v1.3',
      author: 'John Doe',
      timestamp: '2024-01-14 11:20 AM',
      changes: 'Added competitor analysis slides',
      current: false,
    },
    {
      id: 4,
      version: 'v1.2',
      author: 'Bob Johnson',
      timestamp: '2024-01-13 4:15 PM',
      changes: 'Fixed typos and formatting issues',
      current: false,
    },
    {
      id: 5,
      version: 'v1.1',
      author: 'John Doe',
      timestamp: '2024-01-13 9:00 AM',
      changes: 'Initial draft with outline and key slides',
      current: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Version History</h1>
          <p className="text-gray-600 mt-1">Q4 Sales Deck - All versions</p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Version Items */}
          <div className="space-y-6">
            {versions.map((version) => (
              <div key={version.id} className="relative pl-20">
                {/* Timeline Dot */}
                <div
                  className={`absolute left-6 top-6 w-5 h-5 rounded-full border-4 ${
                    version.current
                      ? 'bg-purple-600 border-purple-200'
                      : 'bg-white border-gray-300'
                  }`}
                />

                {/* Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold">{version.version}</h3>
                        {version.current && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        by <span className="font-medium">{version.author}</span> • {version.timestamp}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!version.current && (
                        <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                          Restore
                        </button>
                      )}
                      <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                        Preview
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700">{version.changes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="font-semibold mb-1">Version History Tips</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Versions are automatically saved when you make changes</li>
                <li>• You can restore any previous version at any time</li>
                <li>• Preview versions before restoring to see what changed</li>
                <li>• Version history is kept for 90 days on Pro plans</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

