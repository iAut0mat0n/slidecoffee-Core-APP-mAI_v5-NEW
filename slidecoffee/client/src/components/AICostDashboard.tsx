import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, DollarSign, Zap, TrendingUp, AlertCircle, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];

const MODEL_INFO = {
  "gemini-2.5-flash": { name: "Gemini 2.5 Flash", color: "#6366f1" },
  "claude-3-5-sonnet-20241022": { name: "Claude 3.5 Sonnet", color: "#8b5cf6" },
  "claude-3-opus-20240229": { name: "Claude 3 Opus", color: "#ec4899" },
  "gpt-4": { name: "GPT-4", color: "#f59e0b" },
};

export function AICostDashboard() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  
  // Calculate date range
  const endDate = new Date().toISOString();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90));
  const startDateStr = startDate.toISOString();

  // Fetch metrics
  const { data: aggregatedMetrics, isLoading: metricsLoading } = trpc.aiMetrics.getAggregatedMetrics.useQuery({
    startDate: startDateStr,
    endDate,
    groupBy: "day",
  });

  const { data: modelComparison, isLoading: comparisonLoading } = trpc.aiMetrics.getModelComparison.useQuery({
    startDate: startDateStr,
    endDate,
  });

  const { data: costProjection } = trpc.aiMetrics.getCostProjection.useQuery({ days: 30 });
  
  const { data: recentErrors } = trpc.aiMetrics.getRecentErrors.useQuery({ limit: 5 });

  const { data: systemHealth } = trpc.aiMetrics.getSystemHealth.useQuery();

  // Fetch user-level breakdown (assuming workspaceId = 1 for now)
  const { data: userBreakdown, isLoading: userBreakdownLoading } = trpc.aiMetrics.getUserLevelBreakdown.useQuery({
    workspaceId: 1,
    startDate: startDateStr,
    endDate,
  });

  // Calculate totals
  const totalCost = modelComparison?.reduce((sum, m) => sum + (Number(m.totalCost) || 0), 0) || 0;
  const totalRequests = modelComparison?.reduce((sum, m) => sum + (Number(m.totalRequests) || 0), 0) || 0;
  const avgResponseTime = (modelComparison?.reduce((sum, m) => sum + (Number(m.avgResponseTime) || 0), 0) || 0) / (modelComparison?.length || 1);
  const avgSuccessRate = (modelComparison?.reduce((sum, m) => sum + (Number(m.successRate) || 0), 0) || 0) / (modelComparison?.length || 1);

  // Format chart data
  const costTrendData = aggregatedMetrics?.map(m => ({
    date: new Date(m.groupKey as string).toLocaleDateString(),
    cost: Number(m.totalCost?.toFixed(4) || 0),
    requests: Number(m.totalRequests || 0),
  })) || [];

  const modelCostData = modelComparison?.map(m => ({
    name: MODEL_INFO[m.model as keyof typeof MODEL_INFO]?.name || m.model,
    cost: Number(m.totalCost?.toFixed(2) || 0),
    requests: Number(m.totalRequests || 0),
    avgTime: Number(m.avgResponseTime?.toFixed(0) || 0),
  })) || [];

  if (metricsLoading || comparisonLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading metrics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Cost & Performance Dashboard</h2>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <TabsList>
            <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
            <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === "7d" ? "Last 7 days" : timeRange === "30d" ? "Last 30 days" : "Last 90 days"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${(totalCost / totalRequests || 0).toFixed(4)} per request
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">
              Success rate: {avgSuccessRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">30-Day Projection</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costProjection?.projectedCost.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">
              ${costProjection?.avgDailyCost.toFixed(2) || "0.00"} per day avg
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health Alert */}
      {systemHealth && (systemHealth.ai !== "healthy" || systemHealth.database !== "healthy") && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            System health degraded: {systemHealth.ai !== "healthy" && "AI service issue detected. "}
            {systemHealth.database !== "healthy" && "Database connection issue detected."}
          </AlertDescription>
        </Alert>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Trend</CardTitle>
            <CardDescription>Daily AI usage costs over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cost" stroke="#6366f1" name="Cost ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Request Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Request Volume</CardTitle>
            <CardDescription>Daily AI request count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="requests" fill="#8b5cf6" name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model Comparison - Cost */}
        <Card>
          <CardHeader>
            <CardTitle>Cost by Model</CardTitle>
            <CardDescription>Total cost per AI model</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelCostData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cost" fill="#6366f1" name="Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model Comparison - Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time by Model</CardTitle>
            <CardDescription>Average response time (ms)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelCostData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgTime" fill="#ec4899" name="Avg Time (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User-Level Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User-Level AI Usage</CardTitle>
              <CardDescription>Cost and usage breakdown by user</CardDescription>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {userBreakdownLoading ? (
            <div className="text-center text-muted-foreground py-4">Loading user breakdown...</div>
          ) : !userBreakdown || userBreakdown.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">No user data available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">User</th>
                    <th className="text-right p-2 font-medium">Requests</th>
                    <th className="text-right p-2 font-medium">Total Cost</th>
                    <th className="text-right p-2 font-medium">Avg Response Time</th>
                    <th className="text-right p-2 font-medium">Tokens Used</th>
                  </tr>
                </thead>
                <tbody>
                  {userBreakdown.map((user) => (
                    <tr key={user.userId} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="font-medium">{user.userName || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{user.userEmail}</div>
                      </td>
                      <td className="text-right p-2">{Number(user.totalRequests || 0).toLocaleString()}</td>
                      <td className="text-right p-2 font-medium">${Number(user.totalCost || 0).toFixed(2)}</td>
                      <td className="text-right p-2">{Number(user.avgResponseTime || 0).toFixed(0)}ms</td>
                      <td className="text-right p-2">{Number(user.totalTokens || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td className="p-2">Total</td>
                    <td className="text-right p-2">
                      {userBreakdown.reduce((sum, u) => sum + Number(u.totalRequests || 0), 0).toLocaleString()}
                    </td>
                    <td className="text-right p-2">
                      ${userBreakdown.reduce((sum, u) => sum + Number(u.totalCost || 0), 0).toFixed(2)}
                    </td>
                    <td className="text-right p-2">-</td>
                    <td className="text-right p-2">
                      {userBreakdown.reduce((sum, u) => sum + Number(u.totalTokens || 0), 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Errors */}
      {recentErrors && recentErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Errors</CardTitle>
            <CardDescription>Last {recentErrors.length} failed AI requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentErrors.map((error) => (
                <div key={error.id} className="flex justify-between items-start p-2 border rounded">
                  <div>
                    <div className="font-medium">{error.model}</div>
                    <div className="text-sm text-muted-foreground">{error.errorMessage}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(error.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

