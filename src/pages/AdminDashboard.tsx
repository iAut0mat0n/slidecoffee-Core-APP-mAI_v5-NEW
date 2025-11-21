import LogoUploadSection from '../components/LogoUploadSection';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '12,543', change: '+12%', trend: 'up' },
    { label: 'Active Workspaces', value: '3,421', change: '+8%', trend: 'up' },
    { label: 'Presentations Created', value: '45,678', change: '+15%', trend: 'up' },
    { label: 'AI Generations', value: '89,234', change: '+22%', trend: 'up' },
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', plan: 'Pro', joined: '2 hours ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', plan: 'Enterprise', joined: '5 hours ago' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', plan: 'Starter', joined: '1 day ago' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', plan: 'Pro', joined: '2 days ago' },
  ];

  const systemHealth = [
    { service: 'API Server', status: 'healthy', uptime: '99.9%' },
    { service: 'Database', status: 'healthy', uptime: '99.8%' },
    { service: 'AI Service', status: 'healthy', uptime: '99.7%' },
    { service: 'Storage', status: 'healthy', uptime: '100%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">System overview and user management</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white font-medium">
              Export Report
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
              System Settings
            </button>
          </div>
        </div>

        {/* Logo Upload Section */}
        <LogoUploadSection />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from last month
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Recent Users</h3>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name[0]}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-600">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-purple-600">{user.plan}</div>
                    <div className="text-xs text-gray-500">{user.joined}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
              View All Users
            </button>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">System Health</h3>
            <div className="space-y-3">
              {systemHealth.map((service) => (
                <div key={service.service} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">{service.service}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-600 capitalize">{service.status}</div>
                    <div className="text-xs text-gray-500">{service.uptime} uptime</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
              View Detailed Logs
            </button>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">User Activity (Last 30 Days)</h3>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {[65, 72, 68, 75, 82, 78, 85, 92, 88, 95, 90, 98, 94, 100, 96, 102, 98, 105, 101, 108, 104, 110, 106, 112, 108, 115, 111, 118, 114, 120].map((height, i) => (
              <div key={i} className="flex-1 bg-purple-200 rounded-t hover:bg-purple-300 transition-colors" style={{ height: `${height / 1.5}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

