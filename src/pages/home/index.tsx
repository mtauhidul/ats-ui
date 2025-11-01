import { FeatureCard } from "@/components/feature-card";
import { LogoCloud } from "@/components/logo-cloud";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Brain,
  Mail,
  Shield,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const features = [
    {
      icon: Brain,
      title: "AI Resume Parser",
      description:
        "Extract and validate candidate data automatically with OpenAI & Affinda powered intelligent parsing",
    },
    {
      icon: Mail,
      title: "Email Automation",
      description:
        "Send automated interview invites, status updates, and notifications with custom templates via Resend",
    },
    {
      icon: Workflow,
      title: "Multi-Stage Pipeline",
      description:
        "Manage candidates through customizable hiring stages with drag-and-drop workflow automation",
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description:
        "Enterprise-grade security with granular permissions and comprehensive RBAC system",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Ripple Effect */}
      <div className="absolute inset-0 [--cell-border-color:hsl(var(--primary)/0.3)] [--cell-fill-color:hsl(var(--primary)/0.15)] [--cell-shadow-color:hsl(var(--primary)/0.4)]">
        <BackgroundRippleEffect rows={10} cols={30} cellSize={48} />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-6 py-16 md:px-8 lg:px-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-sm text-foreground/80 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Modern Applicant Tracking System</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
            Hire Better,
            <br />
            <span className="text-primary">Faster & Smarter</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Streamline your recruitment process with an intelligent platform
            designed for modern hiring teams
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="group text-base px-8">
              <Link to="/dashboard">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base px-8"
            >
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 max-w-6xl mx-auto border-t border-l">
          {features.map((feature) => (
            <FeatureCard
              className="border-r border-b"
              feature={feature}
              key={feature.title}
            />
          ))}
        </div>

        {/* Powered By Section */}
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Powered By
            </h2>
            <p className="text-sm text-muted-foreground">
              Built with industry-leading providers and cloud services
            </p>
          </div>

          <LogoCloud logos={logos} />
        </div>
      </div>
    </div>
  );
}

const logos = [
  {
    src: "/src/assets/logo/openai.png",
    alt: "OpenAI",
  },
  {
    src: "/src/assets/logo/zoom.png",
    alt: "Zoom",
  },
  {
    src: "/src/assets/logo/resend.png",
    alt: "Resend",
  },
  {
    src: "/src/assets/logo/heroku.png",
    alt: "Heroku",
  },
  {
    src: "/src/assets/logo/cloudinary.png",
    alt: "Cloudinary",
  },
  {
    src: "/src/assets/logo/affinda.png",
    alt: "Affinda",
  },
  {
    src: "/src/assets/logo/vercel.png",
    alt: "Vercel",
  },
];
