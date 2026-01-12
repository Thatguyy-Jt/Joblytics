import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Settings = () => {
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    resumeSummary: "",
    phone: "",
    location: "",
    linkedInUrl: "",
    portfolioUrl: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        resumeSummary: user.profile?.resumeSummary || "",
        phone: user.profile?.phone || "",
        location: user.profile?.location || "",
        linkedInUrl: user.profile?.linkedInUrl || "",
        portfolioUrl: user.profile?.portfolioUrl || "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one professional link is provided
    const hasLinkedIn = formData.linkedInUrl.trim() !== '';
    const hasPortfolio = formData.portfolioUrl.trim() !== '';
    if (!hasLinkedIn && !hasPortfolio) {
      toast.error('Please provide either a LinkedIn URL or Portfolio URL (at least one is required)');
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        profile: {
          resumeSummary: formData.resumeSummary.trim(),
        },
      };

      // Only include optional profile fields if they have values
      if (formData.phone.trim()) {
        payload.profile.phone = formData.phone.trim();
      }
      if (formData.location.trim()) {
        payload.profile.location = formData.location.trim();
      }
      if (formData.linkedInUrl.trim()) {
        payload.profile.linkedInUrl = formData.linkedInUrl.trim();
      }
      if (formData.portfolioUrl.trim()) {
        payload.profile.portfolioUrl = formData.portfolioUrl.trim();
      }

      // Only include email if it changed
      if (formData.email !== user?.email) {
        payload.email = formData.email.trim();
      }

      const response = await authAPI.updateProfile(payload);
      const updatedUser = response.data?.data?.user || response.data?.user;
      
      // Update auth context
      await checkAuth();
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.errors?.[0]?.message || "Failed to update profile";
      toast.error(errorMessage);
      console.error("Full error response:", error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

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
            Settings
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            Manage your profile and preferences
          </motion.p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium mb-2">
                      Location
                    </label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Resume Summary - Important for AI Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Resume Summary
                    <span className="text-red-500">*</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Required for AI Features:</strong> Add a summary of your resume, skills, and experience. 
                      This is used by AI tools to analyze resume matches and provide interview preparation tips.
                    </p>
                  </div>
                  <Textarea
                    id="resumeSummary"
                    name="resumeSummary"
                    value={formData.resumeSummary}
                    onChange={handleChange}
                    placeholder="Example: Software engineer with 5+ years of experience in full-stack development. Proficient in JavaScript, React, Node.js, and Python. Experience building scalable web applications and RESTful APIs. Strong problem-solving skills and experience with agile methodologies."
                    rows={8}
                    maxLength={2000}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {formData.resumeSummary.length}/2000 characters
                  </p>
                </CardContent>
              </Card>

              {/* Professional Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="linkedInUrl" className="block text-sm font-medium mb-2">
                      LinkedIn URL
                    </label>
                    <Input
                      id="linkedInUrl"
                      name="linkedInUrl"
                      type="url"
                      value={formData.linkedInUrl}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      At least one professional link is required (LinkedIn or Portfolio)
                    </p>
                  </div>

                  <div>
                    <label htmlFor="portfolioUrl" className="block text-sm font-medium mb-2">
                      Portfolio URL
                    </label>
                    <Input
                      id="portfolioUrl"
                      name="portfolioUrl"
                      type="url"
                      value={formData.portfolioUrl}
                      onChange={handleChange}
                      placeholder="https://yourportfolio.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional, but required if LinkedIn URL is not provided
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Save Changes</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Make sure to add your resume summary to use AI features like Resume Match and Interview Prep.
                  </p>
                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={loading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Save Profile"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

