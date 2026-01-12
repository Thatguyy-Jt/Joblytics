import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { applicationsAPI } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CreateApplication = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company.trim() || !formData.jobTitle.trim()) {
      toast.error("Company name and job title are required");
      return;
    }

    try {
      setLoading(true);
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

      if (formData.source.trim()) {
        payload.source = formData.source.trim();
      }

      if (formData.notes.trim()) {
        payload.notes = formData.notes.trim();
      }

      const response = await applicationsAPI.create(payload);
      const application = response.data?.data?.application || response.data?.application;
      
      toast.success("Application created successfully!");
      navigate(`/dashboard/applications/${application._id || application.id}`);
    } catch (error: any) {
      console.error("Failed to create application:", error);
      toast.error(error?.response?.data?.message || "Failed to create application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
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
              Add New Application
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Track a new job application
            </motion.p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium mb-2">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="e.g., Google"
                        required
                        maxLength={200}
                      />
                    </div>
                    <div>
                      <label htmlFor="jobTitle" className="block text-sm font-medium mb-2">
                        Job Title <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        placeholder="e.g., Software Engineer"
                        required
                        maxLength={200}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="jobLink" className="block text-sm font-medium mb-2">
                      Job Posting URL
                    </label>
                    <Input
                      id="jobLink"
                      name="jobLink"
                      type="url"
                      value={formData.jobLink}
                      onChange={handleChange}
                      placeholder="https://..."
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <label htmlFor="jobDescription" className="block text-sm font-medium mb-2">
                      Job Description
                    </label>
                    <Textarea
                      id="jobDescription"
                      name="jobDescription"
                      value={formData.jobDescription}
                      onChange={handleChange}
                      placeholder="Paste the job description here..."
                      rows={8}
                      maxLength={10000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.jobDescription.length}/10000 characters
                    </p>
                  </div>

                  <div>
                    <label htmlFor="source" className="block text-sm font-medium mb-2">
                      Source
                    </label>
                    <Input
                      id="source"
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      placeholder="e.g., LinkedIn, Company Website"
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium mb-2">
                      Notes
                    </label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Add any additional notes..."
                      rows={4}
                      maxLength={5000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.notes.length}/5000 characters
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status & Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium mb-2">
                      Status
                    </label>
                    <select
                      id="status"
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
                    <label htmlFor="dateApplied" className="block text-sm font-medium mb-2">
                      Date Applied
                    </label>
                    <Input
                      id="dateApplied"
                      name="dateApplied"
                      type="datetime-local"
                      value={formData.dateApplied}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="gradient"
                  className="flex-1"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Creating..." : "Create Application"}
                </Button>
                <Link to="/dashboard/applications">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateApplication;

