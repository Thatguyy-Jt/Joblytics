import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, BarChart3, FileText, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const features = [
    "AI-powered resume optimization",
    "Smart application tracking",
    "Interview preparation tools",
  ];

  return (
    <section className="relative min-h-screen flex items-center hero-gradient overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">
                AI-Powered Job Search Assistant
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
            >
              Track, Organize &{" "}
              <span className="gradient-text">Land Your Dream Job</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8"
            >
              The intelligent job application tracker that uses AI to optimize your resume, 
              prepare you for interviews, and keep you organized throughout your job search.
            </motion.p>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10"
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button variant="hero" size="xl" asChild>
                <Link to="/register">
                  Start Tracking for Free
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <a href="#features">See How It Works</a>
              </Button>
            </motion.div>

            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10 flex items-center gap-4 justify-center lg:justify-start"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 border-2 border-background flex items-center justify-center text-xs text-primary-foreground font-semibold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-foreground">Trusted by 10,000+ job seekers</p>
                <p className="text-muted-foreground">★★★★★ 4.9/5 rating</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="relative perspective-1000">
              {/* Main Dashboard Card */}
              <motion.div
                initial={{ rotateY: -10, rotateX: 5 }}
                animate={{ rotateY: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="bg-card rounded-2xl shadow-2xl border overflow-hidden"
              >
                {/* Mock Dashboard Header */}
                <div className="bg-sidebar p-4 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 bg-sidebar-accent rounded-lg h-8" />
                </div>

                {/* Mock Dashboard Content */}
                <div className="p-6 space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Applied", value: "47", color: "bg-blue-500" },
                      { label: "Interviews", value: "12", color: "bg-amber-500" },
                      { label: "Offers", value: "3", color: "bg-green-500" },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        className="bg-muted/50 rounded-xl p-4 text-center"
                      >
                        <div className={`w-8 h-8 ${stat.color} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                          <span className="text-xs font-bold text-white">{stat.value}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recent Applications */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Recent Applications</h4>
                    {[
                      { company: "Google", role: "Senior Developer", status: "Interview" },
                      { company: "Microsoft", role: "Product Manager", status: "Applied" },
                      { company: "Apple", role: "UX Designer", status: "Review" },
                    ].map((app, i) => (
                      <motion.div
                        key={app.company}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + i * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center font-bold text-primary">
                          {app.company[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{app.company}</p>
                          <p className="text-xs text-muted-foreground">{app.role}</p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                          {app.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute -left-8 top-1/4 bg-card rounded-xl shadow-xl border p-4 hidden lg:flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Response Rate</p>
                  <p className="text-lg font-bold text-foreground">+32%</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 }}
                className="absolute -right-6 top-1/3 bg-card rounded-xl shadow-xl border p-4 hidden lg:flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">AI Resume Score</p>
                  <p className="text-lg font-bold text-foreground">94/100</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 }}
                className="absolute -bottom-4 right-1/4 bg-card rounded-xl shadow-xl border p-4 hidden lg:flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Follow-up Reminder</p>
                  <p className="text-sm font-semibold text-foreground">Google - Tomorrow</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
