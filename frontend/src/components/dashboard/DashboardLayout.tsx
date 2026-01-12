import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Brain,
  BarChart3,
  Bell,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  Search,
  Menu,
  Clock,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { remindersAPI } from "@/lib/api";
import { format, formatDistanceToNow } from "date-fns";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Applications", icon: Briefcase, path: "/dashboard/applications" },
  { name: "AI Tools", icon: Brain, path: "/dashboard/ai-tools" },
  { name: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
  { name: "Reminders", icon: Bell, path: "/dashboard/reminders" },
  { name: "Documents", icon: FileText, path: "/dashboard/documents" },
];

const bottomMenuItems = [
  { name: "Settings", icon: Settings, path: "/dashboard/settings" },
];

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

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    // Navigation is handled in the logout function, no need to navigate here
  };

  const getUserInitials = () => {
    if (!user) return "U";
    // Use firstName and lastName if available, otherwise fall back to name
    if (user.firstName || user.lastName) {
      const first = user.firstName?.[0] || '';
      const last = user.lastName?.[0] || '';
      return (first + last).toUpperCase() || "U";
    }
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  // Load upcoming reminders for notifications
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await remindersAPI.getAll({ 
        limit: 5, 
        sent: false, 
        sortBy: 'reminderDate', 
        sortOrder: 'asc' 
      });
      const reminders = response.data?.data?.reminders || response.data?.reminders || [];
      // Filter to only show reminders in the future
      const upcoming = reminders.filter((r: Reminder) => 
        new Date(r.reminderDate) > new Date()
      );
      setUpcomingReminders(upcoming);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setNotificationsLoading(false);
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-sidebar z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-lg font-bold text-white whitespace-nowrap"
                >
                  Joblytics
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "sidebar-item",
                isActive(item.path) && "active"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="py-4 px-3 border-t border-sidebar-border space-y-2">
          {bottomMenuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "sidebar-item",
                isActive(item.path) && "active"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {getUserInitials()}
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 
                     (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 
                      user?.firstName || user?.lastName || "User")}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email || ""}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Joblytics
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-sidebar z-50 flex flex-col"
            >
              {/* Mobile Menu Header */}
              <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-white">
                    Joblytics
                  </span>
                </Link>
              </div>

              {/* Mobile Menu Items */}
              <nav className="flex-1 py-6 px-3 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "sidebar-item",
                      isActive(item.path) && "active"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>

              {/* Mobile Menu Bottom */}
              <div className="py-4 px-3 border-t border-sidebar-border space-y-2">
                {bottomMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "sidebar-item",
                      isActive(item.path) && "active"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 min-h-screen transition-all duration-300",
          "lg:ml-[280px]",
          isCollapsed && "lg:ml-20",
          "pt-16 lg:pt-0"
        )}
      >
        {/* Top Bar */}
        <header className="h-16 bg-card border-b sticky top-0 lg:top-0 z-30 hidden lg:flex items-center justify-end px-6">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu onOpenChange={(open) => {
              if (open) {
                loadNotifications();
              }
            }}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {upcomingReminders.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {upcomingReminders.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {upcomingReminders.length} upcoming
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notificationsLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : upcomingReminders.length === 0 ? (
                  <div className="p-4 text-center">
                    <Bell className="w-8 h-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No upcoming reminders</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {upcomingReminders.map((reminder) => {
                      const app = reminder.application || reminder.applicationId;
                      const appId = app?._id;
                      return (
                        <DropdownMenuItem
                          key={reminder._id}
                          className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-muted"
                          onClick={() => {
                            if (appId) {
                              navigate(`/dashboard/applications/${appId}`);
                            }
                          }}
                        >
                          <div className="flex items-start gap-2 w-full">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                              reminder.reminderType === "interview" ? "bg-amber-500" :
                              reminder.reminderType === "follow-up" ? "bg-blue-500" : "bg-green-500"
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {getReminderTitle(reminder)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {getReminderDisplay(reminder)}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/reminders" className="w-full cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      <span>View all reminders</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold cursor-pointer">
              {getUserInitials()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
