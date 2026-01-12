import { Link } from "react-router-dom";
import { Sparkles, Twitter, Linkedin, Github, Mail } from "lucide-react";

const Footer = () => {
  const links = {
    product: [
      { name: "Features", href: "#features" },
      { name: "How it Works", href: "#how-it-works" },
      { name: "Testimonials", href: "#testimonials" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
    { name: "GitHub", icon: Github, href: "https://github.com" },
    { name: "Email", icon: Mail, href: "mailto:hello@joblytics.com" },
  ];

  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="section-container py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="mb-8 md:mb-0">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Joblytics
              </span>
            </Link>
            <p className="text-sidebar-foreground/70 text-sm leading-relaxed mb-6">
              The AI-powered job application tracker that helps you land your dream job faster.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/70 hover:text-white hover:bg-primary transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-sidebar-foreground/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-sidebar-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-sidebar-foreground/60">
            © {new Date().getFullYear()} Joblytics. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
