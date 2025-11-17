import { useState } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Clock,
  Share2,
  Download,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  MapPin
} from "lucide-react";
import { trpc } from "@/lib/trpc";

type TimeRange = "7d" | "30d" | "90d" | "all";

export default function Analytics() {
  const { user } = useSupabaseAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [selectedProject, setSelectedProject] = useState<number | "all">("all");

  const { data: workspaces } = trpc.workspaces.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery(
    { workspaceId: workspaces?.[0]?.id || 0 },
    { enabled: !!workspaces?.[0]?.id }
  );

  // Enhanced analytics data
  const analyticsData = {
    totalViews: 1247,
    uniqueViewers: 523,
    avgTimeSpent: "4m 32s",
    shareCount: 89,
    downloadCount: 156,
    completionRate: 84,
    viewsChange: "+23%",
    viewersChange: "+18%",
    timeChange: "+5%",
    shareChange: "+12%",
  };

  const viewsByDay = [
    { date: "Mon", views: 145 },
    { date: "Tue", views: 178 },
    { date: "Wed", views: 162 },
    { date: "Thu", views: 195 },
    { date: "Fri", views: 221 },
    { date: "Sat", views: 98 },
    { date: "Sun", views: 112 },
  ];

  const topProjects = [
    { id: 1, title: "Q4 Business Review", views: 456, viewers: 189, avgTime: "5m 23s", completion: 87 },
    { id: 2, title: "Product Launch Deck", views: 398, viewers: 167, avgTime: "4m 45s", completion: 92 },
    { id: 3, title: "Marketing Strategy 2024", views: 287, viewers: 134, avgTime: "6m 12s", completion: 78 },
    { id: 4, title: "Sales Training", views: 234, viewers: 98, avgTime: "3m 56s", completion: 95 },
    { id: 5, title: "Company Overview", views: 198, viewers: 87, avgTime: "2m 34s", completion: 88 },
  ];

  // Slide-by-slide engagement
  const slideEngagement = [
    { slide: 1, title: "Title Slide", views: 1247, avgTime: 45, dropOff: 0 },
    { slide: 2, title: "Introduction", views: 1198, avgTime: 38, dropOff: 3.9 },
    { slide: 3, title: "Problem Statement", views: 1156, avgTime: 52, dropOff: 3.5 },
    { slide: 4, title: "Our Solution", views: 1089, avgTime: 41, dropOff: 5.8 },
    { slide: 5, title: "Key Features", views: 1034, avgTime: 48, dropOff: 5.1 },
    { slide: 6, title: "Market Analysis", views: 987, avgTime: 35, dropOff: 4.5 },
    { slide: 7, title: "Pricing", views: 945, avgTime: 29, dropOff: 4.3 },
    { slide: 8, title: "Call to Action", views: 912, avgTime: 44, dropOff: 3.5 },
  ];

  // Device breakdown
  const deviceBreakdown = [
    { device: "Desktop", icon: Monitor, percentage: 62, count: 774, color: "from-blue-500 to-blue-600" },
    { device: "Mobile", icon: Smartphone, percentage: 28, count: 349, color: "from-purple-500 to-purple-600" },
    { device: "Tablet", icon: Tablet, percentage: 10, count: 124, color: "from-pink-500 to-pink-600" },
  ];

  // Geographic distribution
  const geographicData = [
    { country: "United States", views: 487, percentage: 39, flag: "🇺🇸" },
    { country: "United Kingdom", views: 312, percentage: 25, flag: "🇬🇧" },
    { country: "Canada", views: 187, percentage: 15, flag: "🇨🇦" },
    { country: "Germany", views: 124, percentage: 10, flag: "🇩🇪" },
    { country: "Others", views: 137, percentage: 11, flag: "🌍" },
  ];

  const maxViews = Math.max(...viewsByDay.map(d => d.views));
  const maxSlideViews = Math.max(...slideEngagement.map(s => s.views));

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Detailed engagement metrics and user behavior insights
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Project Filter */}
              <Select value={selectedProject.toString()} onValueChange={(v) => setSelectedProject(v === "all" ? "all" : parseInt(v))}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Time Range Filter */}
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="p-6 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Views</span>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold">{analyticsData.totalViews.toLocaleString()}</div>
              <div className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {analyticsData.viewsChange}
              </div>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Unique Viewers</span>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold">{analyticsData.uniqueViewers.toLocaleString()}</div>
              <div className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {analyticsData.viewersChange}
              </div>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg. Time</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold">{analyticsData.avgTimeSpent}</div>
              <div className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {analyticsData.timeChange}
              </div>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Completion</span>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold">{analyticsData.completionRate}%</div>
              <div className="text-sm text-green-600 mt-2">
                Viewers finish presentation
              </div>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Shares</span>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold">{analyticsData.shareCount}</div>
              <div className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {analyticsData.shareChange}
              </div>
            </div>
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="slides">Slide Engagement</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="projects">Top Projects</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Views Over Time */}
              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Views Over Time</h3>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-4">
                  {viewsByDay.map((day) => (
                    <div key={day.date} className="flex items-center gap-4">
                      <span className="text-sm font-medium w-12">{day.date}</span>
                      <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                          style={{ width: `${(day.views / maxViews) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">{day.views}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Slide Engagement Tab */}
            <TabsContent value="slides" className="space-y-6">
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-lg font-semibold mb-6">Slide-by-Slide Engagement</h3>
                <div className="space-y-4">
                  {slideEngagement.map((slide) => (
                    <div key={slide.slide} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                            {slide.slide}
                          </div>
                          <div>
                            <div className="font-medium">{slide.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {slide.views} views • {slide.avgTime}s avg time
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{slide.dropOff.toFixed(1)}% drop-off</div>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                          style={{ width: `${(slide.views / maxSlideViews) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Audience Tab */}
            <TabsContent value="audience" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Breakdown */}
                <div className="p-6 rounded-lg border bg-card">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Device Breakdown
                  </h3>
                  <div className="space-y-4">
                    {deviceBreakdown.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.device} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{item.device}</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-semibold">{item.percentage}%</span>
                              <span className="text-muted-foreground ml-2">({item.count})</span>
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${item.color}`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Geographic Distribution */}
                <div className="p-6 rounded-lg border bg-card">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Geographic Distribution
                  </h3>
                  <div className="space-y-4">
                    {geographicData.map((item) => (
                      <div key={item.country} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{item.flag}</span>
                            <span className="font-medium">{item.country}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold">{item.percentage}%</span>
                            <span className="text-muted-foreground ml-2">({item.views})</span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Top Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-lg font-semibold mb-6">Top Performing Projects</h3>
                <div className="space-y-4">
                  {topProjects.map((project, idx) => (
                    <div key={project.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-5 gap-4">
                        <div className="col-span-2">
                          <h4 className="font-semibold truncate">{project.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {project.views} views
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{project.viewers}</div>
                          <div className="text-xs text-muted-foreground">Viewers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{project.avgTime}</div>
                          <div className="text-xs text-muted-foreground">Avg Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{project.completion}%</div>
                          <div className="text-xs text-muted-foreground">Completion</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Empty State */}
          {projects?.length === 0 && (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No analytics data yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                ☕ Share your presentations to start tracking engagement metrics
              </p>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Create Your First Presentation
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

