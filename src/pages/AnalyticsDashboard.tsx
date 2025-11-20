export default function AnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your presentation performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Views', value: '12,543', change: '+12%', trend: 'up' },
            { label: 'Presentations', value: '24', change: '+3', trend: 'up' },
            { label: 'Avg. Time', value: '4:32', change: '+8%', trend: 'up' },
            { label: 'Engagement', value: '87%', change: '-2%', trend: 'down' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from last month
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Views Over Time</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {[45, 52, 48, 65, 58, 72, 68, 75, 82, 78, 85, 92].map((height, i) => (
                <div key={i} className="flex-1 bg-purple-200 rounded-t" style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Jan</span>
              <span>Dec</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Top Presentations</h3>
            <div className="space-y-3">
              {[
                { name: 'Q4 Sales Deck', views: 1243, engagement: 92 },
                { name: 'Product Launch', views: 987, engagement: 88 },
                { name: 'Investor Pitch', views: 756, engagement: 95 },
                { name: 'Team Update', views: 543, engagement: 78 },
              ].map((pres) => (
                <div key={pres.name} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{pres.name}</div>
                    <div className="text-xs text-gray-500">{pres.views} views</div>
                  </div>
                  <div className="text-sm font-medium text-purple-600">{pres.engagement}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'Viewed', presentation: 'Q4 Sales Deck', user: 'john@example.com', time: '2 min ago' },
              { action: 'Shared', presentation: 'Product Launch', user: 'jane@example.com', time: '15 min ago' },
              { action: 'Exported', presentation: 'Investor Pitch', user: 'bob@example.com', time: '1 hour ago' },
              { action: 'Created', presentation: 'Team Update', user: 'alice@example.com', time: '3 hours ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                  {activity.user[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action.toLowerCase()}{' '}
                    <span className="font-medium">{activity.presentation}</span>
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

