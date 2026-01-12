import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Briefcase,
  Filter,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { remindersAPI, applicationsAPI } from "@/lib/api";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Reminder {
  _id: string;
  application: {
    _id: string;
    company: string;
    jobTitle: string;
  };
  applicationId?: {
    _id: string;
    company: string;
    jobTitle: string;
  }; // Support both formats for backward compatibility
  reminderType: string;
  reminderDate: string;
  sent: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Application {
  _id: string;
  company: string;
  jobTitle: string;
}

const reminderTypeLabels: Record<string, string> = {
  "follow-up": "Follow-up",
  interview: "Interview",
  deadline: "Deadline",
};

const reminderTypeColors: Record<string, string> = {
  "follow-up": "bg-blue-500",
  interview: "bg-amber-500",
  deadline: "bg-red-500",
};

const Reminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "sent">("all");
  const [reminderTypeFilter, setReminderTypeFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState({
    applicationId: "",
    reminderType: "follow-up",
    reminderDate: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, [filter, reminderTypeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [remindersRes, applicationsRes] = await Promise.all([
        remindersAPI.getAll({ limit: 100 }),
        applicationsAPI.getAll({ limit: 100 }),
      ]);

      const remindersData = remindersRes.data?.data?.reminders || remindersRes.data?.reminders || [];
      const applicationsData = applicationsRes.data?.data?.applications || applicationsRes.data?.applications || [];

      setApplications(applicationsData);
      
      // Filter reminders
      let filtered = remindersData;
      if (filter === "upcoming") {
        filtered = remindersData.filter((r: Reminder) => !r.sent && new Date(r.reminderDate) > new Date());
      } else if (filter === "past") {
        filtered = remindersData.filter((r: Reminder) => new Date(r.reminderDate) < new Date());
      } else if (filter === "sent") {
        filtered = remindersData.filter((r: Reminder) => r.sent);
      }

      if (reminderTypeFilter !== "all") {
        filtered = filtered.filter((r: Reminder) => r.reminderType === reminderTypeFilter);
      }

      // Sort by reminder date
      filtered.sort((a: Reminder, b: Reminder) => 
        new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime()
      );

      setReminders(filtered);
    } catch (error: any) {
      console.error("Failed to load reminders:", error);
      toast.error(error?.response?.data?.message || "Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.applicationId || !formData.reminderDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Convert datetime-local to ISO string
      // datetime-local format: "YYYY-MM-DDTHH:mm"
      // We need to ensure it's treated as local time and converted to ISO
      const localDate = new Date(formData.reminderDate);
      
      // Check if date is in the future
      if (localDate <= new Date()) {
        toast.error("Reminder date must be in the future");
        return;
      }

      const payload = {
        applicationId: formData.applicationId,
        reminderType: formData.reminderType,
        reminderDate: localDate.toISOString(),
        notes: formData.notes || "",
      };

      await remindersAPI.create(payload);
      toast.success("Reminder created successfully");
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error("Failed to create reminder:", error);
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.response?.data?.errors?.[0]?.message ||
                          "Failed to create reminder";
      toast.error(errorMessage);
    }
  };

  const handleUpdate = async () => {
    if (!editingReminder || !formData.reminderDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Convert datetime-local to ISO string
      const localDate = new Date(formData.reminderDate);
      
      // Check if date is in the future (only for new dates, not updates to existing reminders)
      // For updates, we'll let the backend validate

      const payload: any = {
        reminderType: formData.reminderType,
        reminderDate: localDate.toISOString(),
      };

      if (formData.notes !== undefined) {
        payload.notes = formData.notes;
      }

      await remindersAPI.update(editingReminder._id, payload);
      toast.success("Reminder updated successfully");
      setEditingReminder(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error("Failed to update reminder:", error);
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.response?.data?.errors?.[0]?.message ||
                          "Failed to update reminder";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reminder?")) {
      return;
    }

    try {
      await remindersAPI.delete(id);
      toast.success("Reminder deleted successfully");
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete reminder");
    }
  };

  const resetForm = () => {
    setFormData({
      applicationId: "",
      reminderType: "follow-up",
      reminderDate: "",
      notes: "",
    });
  };

  const openEditModal = (reminder: Reminder) => {
    setEditingReminder(reminder);
    const app = reminder.application || reminder.applicationId;
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const reminderDate = new Date(reminder.reminderDate);
    const year = reminderDate.getFullYear();
    const month = String(reminderDate.getMonth() + 1).padStart(2, '0');
    const day = String(reminderDate.getDate()).padStart(2, '0');
    const hours = String(reminderDate.getHours()).padStart(2, '0');
    const minutes = String(reminderDate.getMinutes()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    setFormData({
      applicationId: app?._id || "",
      reminderType: reminder.reminderType,
      reminderDate: formattedDate,
      notes: reminder.notes || "",
    });
    setShowCreateModal(true);
  };

  const getReminderDateDisplay = (date: string) => {
    const reminderDate = new Date(date);
    if (isPast(reminderDate) && !isToday(reminderDate)) {
      return `Past: ${format(reminderDate, "PPP 'at' p")}`;
    }
    if (isToday(reminderDate)) {
      return `Today at ${format(reminderDate, "p")}`;
    }
    if (isTomorrow(reminderDate)) {
      return `Tomorrow at ${format(reminderDate, "p")}`;
    }
    return format(reminderDate, "PPP 'at' p");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading reminders...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl lg:text-3xl font-bold text-foreground"
            >
              Reminders
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Manage follow-ups and important dates
            </motion.p>
          </div>
          <Button variant="gradient" onClick={() => {
            resetForm();
            setEditingReminder(null);
            setShowCreateModal(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Reminder
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={filter === "upcoming" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("upcoming")}
                >
                  Upcoming
                </Button>
                <Button
                  variant={filter === "past" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("past")}
                >
                  Past
                </Button>
                <Button
                  variant={filter === "sent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("sent")}
                >
                  Sent
                </Button>
              </div>
              <select
                value={reminderTypeFilter}
                onChange={(e) => setReminderTypeFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="all">All Types</option>
                <option value="follow-up">Follow-up</option>
                <option value="interview">Interview</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Reminders List */}
        <Card>
          <CardHeader>
            <CardTitle>{reminders.length} Reminders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {reminders.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No reminders found</p>
                <Button variant="gradient" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Reminder
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {reminders.map((reminder, index) => (
                  <motion.div
                    key={reminder._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        reminderTypeColors[reminder.reminderType] || "bg-gray-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {(() => {
                          const app = reminder.application || reminder.applicationId;
                          const appId = app?._id;
                          const company = app?.company || 'Unknown Company';
                          const jobTitle = app?.jobTitle || '';
                          
                          return appId ? (
                            <Link
                              to={`/dashboard/applications/${appId}`}
                              className="font-medium text-foreground hover:text-primary transition-colors"
                            >
                              {company}
                            </Link>
                          ) : (
                            <span className="font-medium text-foreground">{company}</span>
                          );
                        })()}
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          {reminderTypeLabels[reminder.reminderType] || reminder.reminderType}
                        </span>
                        {reminder.sent && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-600">
                            Sent
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {(reminder.application || reminder.applicationId)?.jobTitle || 'No job title'}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {getReminderDateDisplay(reminder.reminderDate)}
                        </span>
                      </div>
                      {reminder.notes && (
                        <p className="text-xs text-muted-foreground mt-2">{reminder.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(reminder)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(reminder._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-background rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-bold mb-4">
                {editingReminder ? "Edit Reminder" : "Create Reminder"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Application <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.applicationId}
                    onChange={(e) =>
                      setFormData({ ...formData, applicationId: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    required
                  >
                    <option value="">Select an application</option>
                    {applications.map((app) => (
                      <option key={app._id} value={app._id}>
                        {app.company} - {app.jobTitle}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reminder Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.reminderType}
                    onChange={(e) =>
                      setFormData({ ...formData, reminderType: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="follow-up">Follow-up</option>
                    <option value="interview">Interview</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reminder Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.reminderDate}
                    onChange={(e) =>
                      setFormData({ ...formData, reminderDate: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  variant="gradient"
                  onClick={editingReminder ? handleUpdate : handleCreate}
                  className="flex-1"
                >
                  {editingReminder ? "Update" : "Create"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingReminder(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reminders;

