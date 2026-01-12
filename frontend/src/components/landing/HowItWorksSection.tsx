import { motion } from "framer-motion";
import { UserPlus, Upload, Rocket, TrendingUp } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description: "Sign up in seconds and set up your profile. No credit card required to get started.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    step: "02",
    icon: Upload,
    title: "Add Your Applications",
    description: "Import existing applications or add new ones. Our system tracks everything automatically.",
    color: "from-purple-500 to-pink-500",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Leverage AI Tools",
    description: "Use our AI to optimize resumes, generate cover letters, and prepare for interviews.",
    color: "from-orange-500 to-red-500",
  },
  {
    step: "04",
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Monitor your job search with analytics, get reminders, and celebrate your wins.",
    color: "from-green-500 to-emerald-500",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border mb-6">
            <Rocket className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-accent-foreground">Simple Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Get Started in{" "}
            <span className="gradient-text">4 Easy Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From sign-up to landing your dream job, our streamlined process makes job hunting efficient and effective.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
              )}

              <div className="relative bg-card rounded-2xl p-8 border shadow-card hover:shadow-xl transition-shadow duration-300">
                {/* Step Number */}
                <div className={`absolute -top-4 left-8 bg-gradient-to-r ${step.color} text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg`}>
                  Step {step.step}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
