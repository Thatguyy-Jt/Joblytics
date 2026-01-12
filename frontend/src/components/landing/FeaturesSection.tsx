import { motion } from "framer-motion";
import { 
  Briefcase, 
  Brain, 
  BarChart3, 
  Bell, 
  FileText, 
  Target,
  Sparkles,
  TrendingUp
} from "lucide-react";

const features = [
  {
    icon: Briefcase,
    title: "Smart Job Tracking",
    description: "Organize all your applications in one place. Track status, add notes, and never lose track of an opportunity.",
    color: "bg-blue-500",
    lightColor: "bg-blue-100",
  },
  {
    icon: Brain,
    title: "AI Resume Optimization",
    description: "Get AI-powered suggestions to improve your resume bullets and match them to job descriptions.",
    color: "bg-purple-500",
    lightColor: "bg-purple-100",
  },
  {
    icon: FileText,
    title: "Cover Letter Generator",
    description: "Generate personalized cover letters tailored to each job posting using advanced AI technology.",
    color: "bg-green-500",
    lightColor: "bg-green-100",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Visualize your job search progress with detailed charts and insights to optimize your strategy.",
    color: "bg-amber-500",
    lightColor: "bg-amber-100",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Never miss a follow-up with automated reminders and deadline notifications.",
    color: "bg-red-500",
    lightColor: "bg-red-100",
  },
  {
    icon: Target,
    title: "Interview Preparation",
    description: "Access AI-powered interview prep tools with company-specific questions and tips.",
    color: "bg-teal-500",
    lightColor: "bg-teal-100",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-accent-foreground">Powerful Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need to{" "}
            <span className="gradient-text">Land Your Dream Job</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our comprehensive suite of AI-powered tools helps you stay organized, 
            improve your applications, and increase your chances of success.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="feature-card group"
            >
              <div className={`w-14 h-14 ${feature.lightColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 ${feature.color.replace('bg-', 'text-')}`} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            { value: "10,000+", label: "Active Users" },
            { value: "50,000+", label: "Applications Tracked" },
            { value: "85%", label: "Interview Rate Increase" },
            { value: "4.9/5", label: "User Rating" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
