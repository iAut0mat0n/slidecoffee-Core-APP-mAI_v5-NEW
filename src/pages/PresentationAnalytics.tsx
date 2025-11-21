export default function PresentationAnalytics() {
  const stats = [
    { label: 'Total Views', value: '1,234', change: '+12%', trend: 'up' },
    { label: 'Unique Viewers', value: '856', change: '+8%', trend: 'up' },
    { label: 'Avg. Time Spent', value: '4:32', change: '+15%', trend: 'up' },
    { label: 'Completion Rate', value: '78%', change: '-3%', trend: 'down' },
  ];

  const slidePerformance = [
    { slide: 1, title: 'Title Slide', views: 1234, avgTime: '0:12', dropOff: '2%' },
    { slide: 2, title: 'Executive Summary', views: 1210, avgTime: '0:45', dropOff: '5%' },
    { slide: 3, title: 'Revenue Breakdown', views: 1150, avgTime: '1:20', dropOff: '8%' },
    { slide: 4, title: 'Market Analysis', views: 1058, avgTime: '1:05', dropOff: '12%' },
    { slide: 5, title: 'Product Roadmap', views: 931, avgTime: '0:58', dropOff: '22%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Presentation Analytics</h1>
            <p className="text-gray-600 mt-1">Q4 Sales Deck - Performance insights</p>
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>All time</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white font-medium">
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from last period
              </div>
            </div>
          ))}
        </div>

        {/* Views Over Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Views Over Time</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {[45, 52, 48, 65, 72, 68, 75, 82, 78, 85, 92, 88, 95, 90].map((height, i) => (
              <div key={i} className="flex-1 bg-purple-200 rounded-t hover:bg-purple-300 transition-colors cursor-pointer" style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>14 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Slide Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Slide Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Slide</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Title</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">Views</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">Avg. Time</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">Drop-off</th>
                </tr>
              </thead>
              <tbody>
                {slidePerformance.map((slide) => (
                  <tr key={slide.slide} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{slide.slide}</td>
                    <td className="py-3 px-4">{slide.title}</td>
                    <td className="py-3 px-4 text-right">{slide.views}</td>
                    <td className="py-3 px-4 text-right">{slide.avgTime}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        parseInt(slide.dropOff) > 15
                          ? 'bg-red-100 text-red-700'
                          : parseInt(slide.dropOff) > 8
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {slide.dropOff}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Viewer Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Top Locations</h3>
            <div className="space-y-3">
              {[
                { country: 'United States', views: 456, percent: 37 },
                { country: 'United Kingdom', views: 234, percent: 19 },
                { country: 'Canada', views: 178, percent: 14 },
                { country: 'Germany', views: 123, percent: 10 },
                { country: 'France', views: 98, percent: 8 },
              ].map((item) => (
                <div key={item.country}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.country}</span>
                    <span className="text-sm text-gray-600">{item.views} views</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600" style={{ width: `${item.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Devices</h3>
            <div className="space-y-4">
              {[
                { device: 'Desktop', icon: '💻', percent: 62, views: 765 },
                { device: 'Mobile', icon: '📱', percent: 28, views: 346 },
                { device: 'Tablet', icon: '📱', percent: 10, views: 123 },
              ].map((item) => (
                <div key={item.device} className="flex items-center gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{item.device}</span>
                      <span className="text-sm text-gray-600">{item.percent}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600" style={{ width: `${item.percent}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

