import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ExternalLink,
  Calendar,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { applicationsAPI } from "@/lib/api";
import { formatDistanceToNow, format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Application {
  _id: string;
  company: string;
  jobTitle: string;
  status: string;
  appliedDate?: string;
  dateApplied?: string;
  createdAt: string;
  jobLink?: string;
}

const statusColors: Record<string, string> = {
  saved: "badge-applied",
  applied: "badge-applied",
  "under-review": "badge-applied",
  interview: "badge-interviewing",
  offer: "badge-offered",
  rejected: "badge-rejected",
};

const statusLabels: Record<string, string> = {
  saved: "Saved",
  applied: "Applied",
  "under-review": "Review",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadApplications();
  }, [currentPage, statusFilter, sortBy, sortOrder]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await applicationsAPI.getAll(params);
      const data = response.data?.data || response.data;
      setApplications(data.applications || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (error: any) {
      console.error("Failed to load applications:", error);
      toast.error(error?.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, company: string) => {
    if (!confirm(`Are you sure you want to delete the application for ${company}?`)) {
      return;
    }

    try {
      await applicationsAPI.delete(id);
      toast.success("Application deleted successfully");
      loadApplications();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete application");
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusDisplay = (status: string) => {
    if (!status || status.trim() === '') {
      return 'No Status';
    }
    return statusLabels[status] || status;
  };

  const getDateDisplay = (date?: string) => {
    if (!date) return "N/A";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "N/A";
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

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
              Job Applications
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Manage and track all your job applications
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

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by company or job title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="all">All Status</option>
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="under-review">Under Review</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order as "asc" | "desc");
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="company-asc">Company A-Z</option>
                  <option value="company-desc">Company Z-A</option>
                  <option value="dateApplied-desc">Applied Date (Recent)</option>
                  <option value="dateApplied-asc">Applied Date (Oldest)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">
              {total} {total === 1 ? "Application" : "Applications"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading applications...</div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-8 text-center">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "No applications match your filters"
                    : "No applications yet. Add your first one!"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Link to="/dashboard/applications/new">
                    <Button variant="gradient">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Application
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {filteredApplications.map((app, index) => (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
                      {app.company.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          to={`/dashboard/applications/${app._id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {app.company}
                        </Link>
                        {app.jobLink && (
                          <a
                            href={app.jobLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-primary"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{app.jobTitle}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {getDateDisplay(app.dateApplied || app.appliedDate || app.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {app.status && app.status.trim() !== '' ? (
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            statusColors[app.status] || "badge-applied"
                          }`}
                        >
                          {getStatusDisplay(app.status)}
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-medium rounded-full badge-applied">
                          No Status
                        </span>
                      )}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/dashboard/applications/${app._id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(app._id, app.company)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Applications;

