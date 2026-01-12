import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  Building2,
  Briefcase,
  Brain,
  Sparkles,
  FileText,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { applicationsAPI, remindersAPI } from "@/lib/api";
import { format } from "date-fns";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ResumeMatchDisplay from "@/components/ai/ResumeMatchDisplay";
import InterviewPrepDisplay from "@/components/ai/InterviewPrepDisplay";
import ResumeImprovementDisplay from "@/components/ai/ResumeImprovementDisplay";

interface Application {
  _id: string;
  company: string;
  jobTitle: string;
  jobLink?: string;
  jobDescription?: string;
  status: string;
  dateApplied?: string;
  appliedDate?: string;
  source?: string;
  notes?: string;
  aiInsights?: {
    resumeMatch?: any;
    interviewPrep?: any;
    resumeImprovement?: any;
  };
  createdAt: string;
  updatedAt: string;
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

const ApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  
  const hasResumeSummary = user?.profile?.resumeSummary && user.profile.resumeSummary.trim().length > 0;
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<{
    resumeMatch: boolean;
    interviewPrep: boolean;
    resumeImprovement: boolean;
  }>({
    resumeMatch: false,
    interviewPrep: false,
    resumeImprovement: false,
  });
  const [formData, setFormData] = useState({
    company: "",
    jobTitle: "",
    jobLink: "",
    jobDescription: "",
    status: "saved",
    dateApplied: "",
    source: "",
    notes: "",
  });

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const response = await applicationsAPI.getById(id!);
      const app = response.data?.data?.application || response.data?.application;
      setApplication(app);
      setFormData({
        company: app.company || "",
        jobTitle: app.jobTitle || "",
        jobLink: app.jobLink || "",
        jobDescription: app.jobDescription || "",
        status: app.status || "saved",
        dateApplied: app.dateApplied
          ? format(new Date(app.dateApplied), "yyyy-MM-dd'T'HH:mm")
          : app.appliedDate
          ? format(new Date(app.appliedDate), "yyyy-MM-dd'T'HH:mm")
          : "",
        source: app.source || "",
        notes: app.notes || "",
      });
    } catch (error: any) {
      console.error("Failed to load application:", error);
      toast.error(error?.response?.data?.message || "Failed to load application");
      navigate("/dashboard/applications");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.company.trim() || !formData.jobTitle.trim()) {
      toast.error("Company name and job title are required");
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        company: formData.company.trim(),
        jobTitle: formData.jobTitle.trim(),
        status: formData.status,
      };

      if (formData.jobLink.trim()) {
        payload.jobLink = formData.jobLink.trim();
      }

      if (formData.jobDescription.trim()) {
        payload.jobDescription = formData.jobDescription.trim();
      }

      if (formData.dateApplied) {
        payload.dateApplied = new Date(formData.dateApplied).toISOString();
      }

      if (formData.source !== undefined) {
        payload.source = formData.source.trim();
      }

      if (formData.notes !== undefined) {
        payload.notes = formData.notes.trim();
      }

      const response = await applicationsAPI.update(id!, payload);
      const updatedApp = response.data?.data?.application || response.data?.application;
      setApplication(updatedApp);
      setIsEditing(false);
      toast.success("Application updated successfully!");
    } catch (error: any) {
      console.error("Failed to update application:", error);
      toast.error(error?.response?.data?.message || "Failed to update application");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this application for ${application?.company}?`)) {
      return;
    }

    try {
      await applicationsAPI.delete(id!);
      toast.success("Application deleted successfully");
      navigate("/dashboard/applications");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete application");
    }
  };

  const handleAI = async (type: "resumeMatch" | "interviewPrep" | "resumeImprovement") => {
    if (!application) return;

    // Check if resume summary is required and missing
    if ((type === "resumeMatch" || type === "interviewPrep") && !hasResumeSummary) {
      toast.error("Resume summary is required. Please add it in Settings.");
      navigate("/dashboard/settings");
      return;
    }

    try {
      setAiLoading((prev) => ({ ...prev, [type]: true }));

      let response;
      if (type === "resumeMatch") {
        response = await applicationsAPI.generateResumeMatch(id!);
      } else if (type === "interviewPrep") {
        response = await applicationsAPI.generateInterviewPrep(id!);
      } else {
        // Resume improvement requires resume bullets
        const resumeBullets = prompt("Enter your resume bullets (one per line):");
        if (!resumeBullets) {
          setAiLoading((prev) => ({ ...prev, [type]: false }));
          return;
        }
        response = await applicationsAPI.generateResumeImprovement(id!, {
          resumeBullets: resumeBullets.split("\n").filter((b) => b.trim()),
        });
      }

      toast.success(`${type === "resumeMatch" ? "Resume Match" : type === "interviewPrep" ? "Interview Prep" : "Resume Improvement"} analysis generated!`);
      loadApplication(); // Reload to get updated AI insights
    } catch (error: any) {
      console.error(`Failed to generate ${type}:`, error);
      toast.error(error?.response?.data?.message || `Failed to generate ${type} analysis`);
    } finally {
      setAiLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading application...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Application not found</p>
          <Link to="/dashboard/applications">
            <Button>Back to Applications</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/applications">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl lg:text-3xl font-bold text-foreground"
              >
                {isEditing ? "Edit Application" : application.company}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground mt-1"
              >
                {isEditing ? "Update application details" : application.jobTitle}
              </motion.p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    statusColors[application.status] || "badge-applied"
                  }`}
                >
                  {statusLabels[application.status] || application.status}
                </span>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={handleDelete} className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button variant="gradient" onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Details */}
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Job Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Job Posting URL</label>
                      <Input
                        name="jobLink"
                        type="url"
                        value={formData.jobLink}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Job Description</label>
                      <Textarea
                        name="jobDescription"
                        value={formData.jobDescription}
                        onChange={handleChange}
                        rows={8}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Source</label>
                      <Input
                        name="source"
                        value={formData.source}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Notes</label>
                      <Textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      >
                        <option value="saved">Saved</option>
                        <option value="applied">Applied</option>
                        <option value="under-review">Under Review</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date Applied</label>
                      <Input
                        name="dateApplied"
                        type="datetime-local"
                        value={formData.dateApplied}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Company
                        </label>
                        <p className="text-foreground font-medium">{application.company}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Job Title
                        </label>
                        <p className="text-foreground font-medium">{application.jobTitle}</p>
                      </div>
                    </div>
                    {application.jobLink && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Job Posting
                        </label>
                        <a
                          href={application.jobLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          View Job Posting <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {application.jobDescription && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Job Description
                        </label>
                        <p className="text-foreground whitespace-pre-wrap">{application.jobDescription}</p>
                      </div>
                    )}
                    {application.source && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Source
                        </label>
                        <p className="text-foreground">{application.source}</p>
                      </div>
                    )}
                    {application.notes && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Notes
                        </label>
                        <p className="text-foreground whitespace-pre-wrap">{application.notes}</p>
                      </div>
                    )}
                    {application.dateApplied || application.appliedDate ? (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Date Applied
                        </label>
                        <p className="text-foreground">
                          {format(
                            new Date(application.dateApplied || application.appliedDate!),
                            "PPP 'at' p"
                          )}
                        </p>
                      </div>
                    ) : null}
                  </>
                )}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleAI("resumeMatch")}
                    disabled={aiLoading.resumeMatch || !application.jobDescription || !hasResumeSummary}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Resume Match</span>
                    {aiLoading.resumeMatch && <span className="text-xs">Generating...</span>}
                    {!hasResumeSummary && (
                      <span className="text-xs text-red-500">Requires resume summary</span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAI("interviewPrep")}
                    disabled={aiLoading.interviewPrep || !application.jobDescription || !hasResumeSummary}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Brain className="w-5 h-5" />
                    <span>Interview Prep</span>
                    {aiLoading.interviewPrep && <span className="text-xs">Generating...</span>}
                    {!hasResumeSummary && (
                      <span className="text-xs text-red-500">Requires resume summary</span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAI("resumeImprovement")}
                    disabled={aiLoading.resumeImprovement}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Resume Improvement</span>
                    {aiLoading.resumeImprovement && <span className="text-xs">Generating...</span>}
                  </Button>
                </div>

                {application.aiInsights?.resumeMatch && (
                  <div className="mt-4">
                    <ResumeMatchDisplay data={application.aiInsights.resumeMatch} />
                  </div>
                )}

                {application.aiInsights?.interviewPrep && (
                  <div className="mt-4">
                    <InterviewPrepDisplay data={application.aiInsights.interviewPrep} />
                  </div>
                )}

                {application.aiInsights?.resumeImprovement && (
                  <div className="mt-4">
                    <ResumeImprovementDisplay data={application.aiInsights.resumeImprovement} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </label>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${
                      statusColors[application.status] || "badge-applied"
                    }`}
                  >
                    {statusLabels[application.status] || application.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Created
                  </label>
                  <p className="text-foreground text-sm">
                    {format(new Date(application.createdAt), "PPP")}
                  </p>
                </div>
                {application.updatedAt && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Last Updated
                    </label>
                    <p className="text-foreground text-sm">
                      {format(new Date(application.updatedAt), "PPP")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApplicationDetails;

