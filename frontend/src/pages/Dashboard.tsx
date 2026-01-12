import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  MoreHorizontal,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { applicationsAPI, analyticsAPI, remindersAPI } from "@/lib/api";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Application {
  _id: string;
  company: string;
  jobTitle: string;
  status: string;
  appliedDate: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  Applied: "badge-applied",
  Interview: "badge-interviewing",
  Review: "badge-applied",
  Offer: "badge-offered",
  Rejected: "badge-rejected",
};

interface Reminder {
  _id: string;
  applicationId?: {
    _id: string;
    company: string;
    jobTitle: string;
  };
  application?: {
    _id: string;
    company: string;
    jobTitle: string;
  };
  reminderType: string;
  reminderDate: string;
  sent: boolean;
  createdAt: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    {
      title: "Total Applications",
      value: "0",
      change: "+0%",
      trend: "up" as const,
      icon: Briefcase,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Success Rate",
      value: "0%",
      change: "+0%",
      trend: "up" as const,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Pending Responses",
      value: "0",
      change: "-0%",
      trend: "down" as const,
      icon: Clock,
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "This Week",
      value: "0",
      change: "+0",
      trend: "up" as const,
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
    },
  ]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, applicationsRes, remindersRes] = await Promise.all([
        analyticsAPI.getComprehensive(),
        applicationsAPI.getAll({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        remindersAPI.getAll({ limit: 3, sent: false, sortBy: 'reminderDate', sortOrder: 'asc' }),
      ]);

      // Backend returns: { success: true, data: { analytics } }
      const analytics = analyticsRes.data?.data?.analytics || analyticsRes.data?.analytics;
      // Backend returns: { success: true, data: { applications, pagination } }
      const applications = applicationsRes.data?.data?.applications || applicationsRes.data?.applications || [];
      // Backend returns: { success: true, data: { reminders, pagination } }
      const reminders = remindersRes.data?.data?.reminders || remindersRes.data?.reminders || [];

      // Update status distribution for Quick Stats section
      const statusDist = analytics?.statusDistribution || [];
      setStatusDistribution(statusDist);

      // Update reminders
      setUpcomingReminders(reminders);

      // Update stats
      const interviewCount = statusDist.find((s: any) => s.status === 'interview')?.count || 0;
      const offerCount = statusDist.find((s: any) => s.status === 'offer')?.count || 0;
      const appliedCount = statusDist.find((s: any) => s.status === 'applied')?.count || 0;
      const underReviewCount = statusDist.find((s: any) => s.status === 'under-review')?.count || 0;
      const rejectedCount = statusDist.find((s: any) => s.status === 'rejected')?.count || 0;
      const total = analytics?.total || 0;
      const successRate = analytics?.successRate?.rate || 0;

      setStats([
        {
          title: "Total Applications",
          value: total.toString(),
          change: "+0%",
          trend: "up",
          icon: Briefcase,
          color: "from-blue-500 to-cyan-500",
        },
        {
          title: "Success Rate",
          value: `${successRate}%`,
          change: "+0%",
          trend: "up",
          icon: TrendingUp,
          color: "from-green-500 to-emerald-500",
        },
        {
          title: "Pending Responses",
          value: appliedCount.toString(),
          change: "-0%",
          trend: "down",
          icon: Clock,
          color: "from-amber-500 to-orange-500",
        },
        {
          title: "Interviews",
          value: interviewCount.toString(),
          change: "+0",
          trend: "up",
          icon: Calendar,
          color: "from-purple-500 to-pink-500",
        },
      ]);

      setRecentApplications(applications);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast.error(error?.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'applied': 'Applied',
      'under-review': 'Review',
      'interview': 'Interview',
      'offer': 'Offer',
      'rejected': 'Rejected',
      'withdrawn': 'Withdrawn',
    };
    return statusMap[status] || status;
  };

  const getDateDisplay = (date: string) => {
    if (!date) return 'N/A';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'N/A';
    }
  };

  const getReminderDisplay = (reminder: Reminder) => {
    const date = new Date(reminder.reminderDate);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return `Today, ${format(date, 'h:mm a')}`;
    if (diffDays === 1) return `Tomorrow, ${format(date, 'h:mm a')}`;
    if (diffDays < 7) return format(date, 'EEE, MMM d, h:mm a');
    return format(date, 'MMM d, yyyy');
  };

  const getReminderTitle = (reminder: Reminder) => {
    // Handle both applicationId (populated) and application (populated) formats
    const app = reminder.application || reminder.applicationId;
    const company = app?.company || 'Unknown Company';
    const jobTitle = app?.jobTitle || '';
    const type = reminder.reminderType;
    
    if (type === 'interview') return `Interview: ${company}`;
    if (type === 'follow-up') return `Follow up: ${company}`;
    if (type === 'deadline') return `Deadline: ${company}`;
    return `${company} - ${jobTitle}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl lg:text-3xl font-bold text-foreground"
            >
              Welcome back, {user?.name || 
                (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 
                 user?.firstName || user?.lastName || 'User')}! 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Here's what's happening with your job search
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/dashboard/applications/new">
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" />
                Add Application
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="stat-card hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        )}
                        <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                          {stat.change}
                        </span>
                        <span className="text-xs text-muted-foreground">vs last month</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold">Recent Applications</CardTitle>
                <Link to="/dashboard/applications">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : recentApplications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No applications yet. Add your first one!</div>
                ) : (
                  <div className="divide-y">
                    {recentApplications.map((app, index) => (
                      <Link key={app._id} to={`/dashboard/applications/${app._id}`}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
                            {app.company.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{app.company}</p>
                            <p className="text-sm text-muted-foreground truncate">{app.jobTitle}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[getStatusDisplay(app.status)] || 'badge-applied'}`}>
                              {getStatusDisplay(app.status)}
                            </span>
                            <span className="text-xs text-muted-foreground hidden sm:block">{getDateDisplay(app.appliedDate || app.createdAt)}</span>
                            <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={(e) => e.preventDefault()}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-primary to-blue-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <Brain className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold">AI Insights</h3>
                  </div>
                  <p className="text-white/80 text-sm mb-4">
                    {stats.find(s => s.title === "Success Rate")?.value !== "0%" 
                      ? `Your success rate is ${stats.find(s => s.title === "Success Rate")?.value}. Keep up the great work!`
                      : "Start tracking your applications to get AI-powered insights and recommendations."}
                  </p>
                  <Link to="/dashboard/ai-tools">
                    <Button className="w-full bg-white text-primary hover:bg-white/90">
                      Get AI Recommendations
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Reminders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Upcoming</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="text-center text-muted-foreground text-sm py-4">Loading reminders...</div>
                  ) : upcomingReminders.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-4">No upcoming reminders</div>
                  ) : (
                    upcomingReminders.map((reminder) => {
                      const app = reminder.application || reminder.applicationId;
                      const appId = app?._id;
                      return (
                        <Link key={reminder._id} to={appId ? `/dashboard/applications/${appId}` : '#'}>
                          <div className="flex items-start gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              reminder.reminderType === "interview" ? "bg-amber-500" :
                              reminder.reminderType === "follow-up" ? "bg-blue-500" : "bg-green-500"
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {getReminderTitle(reminder)}
                              </p>
                              <p className="text-xs text-muted-foreground">{getReminderDisplay(reminder)}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Application Status</h3>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-center text-muted-foreground text-sm py-4">Loading...</div>
                    ) : statusDistribution.length === 0 ? (
                      <div className="text-center text-muted-foreground text-sm py-4">No applications yet</div>
                    ) : (
                      statusDistribution.map((item) => {
                        const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
                          'applied': { label: 'Applied', icon: Clock, color: 'bg-blue-500' },
                          'under-review': { label: 'In Review', icon: Briefcase, color: 'bg-amber-500' },
                          'interview': { label: 'Interview', icon: Calendar, color: 'bg-purple-500' },
                          'offer': { label: 'Offers', icon: CheckCircle2, color: 'bg-green-500' },
                          'rejected': { label: 'Rejected', icon: XCircle, color: 'bg-red-500' },
                        };
                        const config = statusConfig[item.status] || { label: item.status, icon: Briefcase, color: 'bg-gray-500' };
                        const Icon = config.icon;
                        return (
                          <div key={item.status} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${config.color}`} />
                              <span className="text-sm text-muted-foreground">{config.label}</span>
                            </div>
                            <span className="text-sm font-medium">{item.count || 0}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
