import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  FileText,
  Briefcase,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { applicationsAPI } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ResumeMatchDisplay from "@/components/ai/ResumeMatchDisplay";
import InterviewPrepDisplay from "@/components/ai/InterviewPrepDisplay";
import ResumeImprovementDisplay from "@/components/ai/ResumeImprovementDisplay";

interface Application {
  _id: string;
  company: string;
  jobTitle: string;
  status: string;
  jobDescription?: string;
  aiInsights?: {
    resumeMatch?: any;
    interviewPrep?: any;
    resumeImprovement?: any;
  };
  createdAt: string;
}

const AITools = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState<Record<string, string>>({});
  
  const hasResumeSummary = user?.profile?.resumeSummary && user.profile.resumeSummary.trim().length > 0;

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsAPI.getAll({ limit: 100 });
      const data = response.data?.data || response.data;
      setApplications(data.applications || []);
    } catch (error: any) {
      console.error("Failed to load applications:", error);
      toast.error(error?.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleAI = async (
    applicationId: string,
    type: "resumeMatch" | "interviewPrep" | "resumeImprovement"
  ) => {
    // Check if resume summary is required and missing
    if ((type === "resumeMatch" || type === "interviewPrep") && !hasResumeSummary) {
      toast.error("Resume summary is required. Please add it in Settings.");
      return;
    }
    
    const loadingKey = `${applicationId}-${type}`;
    try {
      setAiLoading((prev) => ({ ...prev, [loadingKey]: "loading" }));

      let response;
      if (type === "resumeMatch") {
        response = await applicationsAPI.generateResumeMatch(applicationId);
      } else if (type === "interviewPrep") {
        response = await applicationsAPI.generateInterviewPrep(applicationId);
      } else {
        // Resume improvement requires resume bullets
        const resumeBullets = prompt(
          "Enter your resume bullets (one per line):\n\nExample:\n- Built RESTful APIs using Node.js\n- Implemented authentication system"
        );
        if (!resumeBullets || !resumeBullets.trim()) {
          setAiLoading((prev) => {
            const newState = { ...prev };
            delete newState[loadingKey];
            return newState;
          });
          return;
        }
        response = await applicationsAPI.generateResumeImprovement(applicationId, {
          resumeBullets: resumeBullets.split("\n").filter((b) => b.trim()),
        });
      }

      toast.success(
        `${
          type === "resumeMatch"
            ? "Resume Match"
            : type === "interviewPrep"
            ? "Interview Prep"
            : "Resume Improvement"
        } analysis generated!`
      );
      loadApplications(); // Reload to get updated AI insights
    } catch (error: any) {
      console.error(`Failed to generate ${type}:`, error);
      toast.error(
        error?.response?.data?.message || `Failed to generate ${type} analysis`
      );
    } finally {
      setAiLoading((prev) => {
        const newState = { ...prev };
        delete newState[loadingKey];
        return newState;
      });
    }
  };

  const hasJobDescription = (app: Application) => {
    return app.jobDescription && app.jobDescription.trim().length > 50;
  };


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
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
            AI Tools
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            Get AI-powered insights for your job applications
          </motion.p>
        </div>

        {/* Resume Summary Warning */}
        {!hasResumeSummary && (
          <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Resume Summary Required
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                    To use Resume Match and Interview Prep features, you need to add your resume summary in Settings.
                  </p>
                  <Link to="/dashboard/settings">
                    <Button variant="outline" size="sm" className="border-amber-500 text-amber-700 dark:text-amber-300">
                      Go to Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Applications List */}
        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No applications yet. Add applications to use AI tools.
              </p>
              <Link to="/dashboard/applications/new">
                <Button variant="gradient">Add Application</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {applications.map((app, index) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5" />
                          {app.company}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{app.jobTitle}</p>
                      </div>
                      <Link to={`/dashboard/applications/${app._id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* AI Actions */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3">AI Analysis Tools</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <Button
                          variant="outline"
                          onClick={() => handleAI(app._id, "resumeMatch")}
                          disabled={
                            !!aiLoading[`${app._id}-resumeMatch`] || !hasJobDescription(app) || !hasResumeSummary
                          }
                          className="flex flex-col items-center gap-2 h-auto py-4"
                        >
                          {aiLoading[`${app._id}-resumeMatch`] ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Sparkles className="w-5 h-5" />
                          )}
                          <span>Resume Match</span>
                          {!hasResumeSummary && (
                            <span className="text-xs text-red-500">
                              Requires resume summary
                            </span>
                          )}
                          {hasResumeSummary && !hasJobDescription(app) && (
                            <span className="text-xs text-muted-foreground">
                              Requires job description
                            </span>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleAI(app._id, "interviewPrep")}
                          disabled={
                            !!aiLoading[`${app._id}-interviewPrep`] || !hasJobDescription(app) || !hasResumeSummary
                          }
                          className="flex flex-col items-center gap-2 h-auto py-4"
                        >
                          {aiLoading[`${app._id}-interviewPrep`] ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Brain className="w-5 h-5" />
                          )}
                          <span>Interview Prep</span>
                          {!hasResumeSummary && (
                            <span className="text-xs text-red-500">
                              Requires resume summary
                            </span>
                          )}
                          {hasResumeSummary && !hasJobDescription(app) && (
                            <span className="text-xs text-muted-foreground">
                              Requires job description
                            </span>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleAI(app._id, "resumeImprovement")}
                          disabled={!!aiLoading[`${app._id}-resumeImprovement`]}
                          className="flex flex-col items-center gap-2 h-auto py-4"
                        >
                          {aiLoading[`${app._id}-resumeImprovement`] ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                          <span>Resume Improvement</span>
                        </Button>
                      </div>
                    </div>

                    {/* AI Insights Display */}
                    {(app.aiInsights?.resumeMatch ||
                      app.aiInsights?.interviewPrep ||
                      app.aiInsights?.resumeImprovement) && (
                      <div className="space-y-6 pt-4 border-t">
                        <h3 className="text-lg font-semibold">AI Insights</h3>

                        {app.aiInsights.resumeMatch && (
                          <div>
                            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-primary" />
                              Resume Match Analysis
                            </h4>
                            <ResumeMatchDisplay data={app.aiInsights.resumeMatch} />
                          </div>
                        )}

                        {app.aiInsights.interviewPrep && (
                          <div>
                            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                              <Brain className="w-5 h-5 text-primary" />
                              Interview Preparation Tips
                            </h4>
                            <InterviewPrepDisplay data={app.aiInsights.interviewPrep} />
                          </div>
                        )}

                        {app.aiInsights.resumeImprovement && (
                          <div>
                            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-primary" />
                              Resume Improvement Suggestions
                            </h4>
                            <ResumeImprovementDisplay data={app.aiInsights.resumeImprovement} />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AITools;

