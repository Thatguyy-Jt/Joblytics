import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { analyticsAPI } from "@/lib/api";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface AnalyticsData {
  total: number;
  byStatus: {
    saved: number;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
  };
  monthlyTrends: Array<{
    year: number;
    month: number;
    count: number;
    monthLabel?: string;
  }>;
  successRate: number;
  successful: number;
}

const COLORS = {
  saved: "#3b82f6", // blue
  applied: "#8b5cf6", // purple
  interview: "#f59e0b", // amber
  offer: "#10b981", // green
  rejected: "#ef4444", // red
};

const statusLabels: Record<string, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getComprehensive();
      const data = response.data?.data?.analytics || response.data?.analytics;
      setAnalytics(data);
    } catch (error: any) {
      console.error("Failed to load analytics:", error);
      toast.error(error?.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const prepareStatusData = () => {
    if (!analytics) return [];
    return Object.entries(analytics.byStatus).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
      status,
    }));
  };

  const prepareMonthlyData = () => {
    if (!analytics?.monthlyTrends) return [];
    return analytics.monthlyTrends.map((trend) => {
      const date = new Date(trend.year, trend.month - 1);
      return {
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        count: trend.count,
      };
    });
  };

  const statusData = prepareStatusData();
  const monthlyData = prepareMonthlyData();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No analytics data available</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl lg:text-3xl font-bold text-foreground"
          >
            Analytics Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            Insights into your job application journey
          </motion.p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Applications</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.successRate}%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Successful</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.successful}</p>
                  <p className="text-xs text-muted-foreground mt-1">Interviews + Offers</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending</p>
                  <p className="text-3xl font-bold text-foreground">
                    {analytics.byStatus.applied + analytics.byStatus.saved}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Applied + Saved</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Status Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 && statusData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={statusData.filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData
                        .filter((d) => d.value > 0)
                        .map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[entry.status as keyof typeof COLORS] || "#8884d8"}
                          />
                        ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry.status as keyof typeof COLORS] || "#8884d8"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Monthly Application Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Applications"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No monthly data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Details */}
        <Card>
          <CardHeader>
            <CardTitle>Status Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4">
              {statusData.map((item) => (
                <div key={item.status} className="text-center p-4 bg-muted rounded-lg">
                  <div
                    className="w-4 h-4 rounded-full mx-auto mb-2"
                    style={{
                      backgroundColor: COLORS[item.status as keyof typeof COLORS] || "#8884d8",
                    }}
                  />
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.total > 0
                      ? `${((item.value / analytics.total) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;

