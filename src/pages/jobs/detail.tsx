import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Users,
  Award,
  Heart,
  Building2,
  Globe,
  Laptop,
  Home,
} from "lucide-react";
import type { Job } from "@/types/job";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Extend Job type to match API response
type JobWithExtras = Job & {
  jobType?: string;
  locationType?: string;
  skills?: string[];
};

// Helper function to normalize job data from backend (handle _id to id conversion)
const normalizeJob = (job: any): JobWithExtras => {
  return {
    ...job,
    id: job.id || job._id, // Handle both id and _id fields
  };
};

export default function JobDetailPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState<JobWithExtras | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        // Public endpoint - no authentication needed
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
        const result = await response.json();
        const jobData = result.data || result;
        setJob(normalizeJob(jobData));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching job:", error);
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const formatSalary = (salary?: { min: number; max: number; currency: string; period?: string }) => {
    if (!salary) return "Competitive";
    const format = (num: number) => new Intl.NumberFormat("en-US").format(num);
    const period = salary.period || "year";
    return `${salary.currency} ${format(salary.min)} - ${format(salary.max)} / ${period}`;
  };

  const getWorkModeIcon = (mode: string) => {
    switch (mode?.toLowerCase()) {
      case 'remote':
        return <Laptop className="h-5 w-5" />;
      case 'onsite':
        return <Building2 className="h-5 w-5" />;
      case 'hybrid':
        return <Home className="h-5 w-5" />;
      default:
        return <Briefcase className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-73px)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 [--cell-border-color:hsl(var(--primary)/0.3)] [--cell-fill-color:hsl(var(--primary)/0.15)] [--cell-shadow-color:hsl(var(--primary)/0.4)]">
          <BackgroundRippleEffect rows={10} cols={30} cellSize={48} />
        </div>
        <div className="relative z-10 text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="relative min-h-[calc(100vh-73px)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 [--cell-border-color:hsl(var(--primary)/0.3)] [--cell-fill-color:hsl(var(--primary)/0.15)] [--cell-shadow-color:hsl(var(--primary)/0.4)]">
          <BackgroundRippleEffect rows={10} cols={30} cellSize={48} />
        </div>
        <div className="relative z-10 text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Job not found</h2>
          <Button asChild>
            <Link to="/jobs">Back to Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-73px)] overflow-hidden">
      {/* Background Ripple Effect */}
      <div className="absolute inset-0 [--cell-border-color:hsl(var(--primary)/0.3)] [--cell-fill-color:hsl(var(--primary)/0.15)] [--cell-shadow-color:hsl(var(--primary)/0.4)]">
        <BackgroundRippleEffect rows={10} cols={30} cellSize={48} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 md:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            to="/jobs"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>

          {/* Main Note/Document */}
          <div className="p-8 md:p-12">
            {/* Job Title - Document Header */}
            <div className="mb-8 pb-8 border-b border-border/30">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                {job.title}
              </h1>
              {job.experienceLevel && (
                <p className="text-lg text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {job.experienceLevel} Level Position
                </p>
              )}
            </div>

            {/* Key Info - Inline Pills */}
            <div className="mb-10">
              <div className="flex flex-wrap gap-3">
                {(job.location?.city || job.location?.country) && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium backdrop-blur-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{[job.location?.city, job.location?.country].filter(Boolean).join(", ")}</span>
                  </div>
                )}

                {(job.type || job.jobType) && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-sm font-medium backdrop-blur-sm">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="capitalize">{(job.type || job.jobType).replace(/_/g, " ")}</span>
                  </div>
                )}

                {(job.workMode || job.locationType) && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full text-sm font-medium backdrop-blur-sm">
                    {getWorkModeIcon(job.workMode || job.locationType || '')}
                    <span className="capitalize">{(job.workMode || job.locationType)}</span>
                  </div>
                )}

                {job.openings > 0 && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full text-sm font-medium backdrop-blur-sm">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span>{job.openings} openings</span>
                  </div>
                )}

                {job.salaryRange && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full text-sm font-medium backdrop-blur-sm">
                    <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>{formatSalary(job.salaryRange)}</span>
                  </div>
                )}

                {job.applicationDeadline && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full text-sm font-medium backdrop-blur-sm">
                    <Calendar className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span>
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <hr className="my-10 border-border/50" />

            {/* Job Description */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary" />
                About the Role
              </h2>
              <div className="text-base text-muted-foreground leading-relaxed whitespace-pre-line pl-8">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  What You'll Do
                </h2>
                <ul className="space-y-3 pl-8">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex gap-3 items-start text-base text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span className="flex-1">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {(job.requirements?.experience || 
              job.requirements?.education ||
              (job.requirements?.skills?.required && job.requirements.skills.required.length > 0) ||
              (job.requirements?.skills?.preferred && job.requirements.skills.preferred.length > 0) ||
              (job.requirements?.languages && job.requirements.languages.length > 0) ||
              (job.requirements?.certifications && job.requirements.certifications.length > 0)) && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  What We're Looking For
                </h2>
                <div className="space-y-6 pl-8">
                  {job.requirements?.experience && (
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Experience
                      </h3>
                      <p className="text-muted-foreground pl-6">{job.requirements.experience}</p>
                    </div>
                  )}

                  {job.requirements?.education && (
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        Education
                      </h3>
                      <p className="text-muted-foreground pl-6">{job.requirements.education}</p>
                    </div>
                  )}

                  {job.requirements?.skills?.required && job.requirements.skills.required.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-3">Must-Have Skills</h3>
                      <div className="flex flex-wrap gap-2 pl-6">
                        {job.requirements.skills.required.map((skill) => (
                          <Badge key={skill} className="bg-primary/90 hover:bg-primary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.requirements?.skills?.preferred && job.requirements.skills.preferred.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-3">Nice to Have</h3>
                      <div className="flex flex-wrap gap-2 pl-6">
                        {job.requirements.skills.preferred.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.requirements?.languages && job.requirements.languages.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-2 pl-6">
                        {job.requirements.languages.map((language) => (
                          <Badge key={language} variant="secondary">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.requirements?.certifications && job.requirements.certifications.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-3">Certifications</h3>
                      <ul className="space-y-2 pl-6">
                        {job.requirements.certifications.map((cert) => (
                          <li key={cert} className="flex items-start gap-2 text-muted-foreground">
                            <Award className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills from Job Array */}
            {job.skills && job.skills.length > 0 && !(job.requirements?.skills?.required && job.requirements.skills.required.length > 0) && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2 pl-8">
                  {job.skills.map((skill) => (
                    <Badge key={skill} className="px-3 py-1.5 bg-primary/90 hover:bg-primary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && Array.isArray(job.benefits) && job.benefits.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  What We Offer
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                  {job.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3 text-muted-foreground">
                      <Heart className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer - Apply Again */}
            <div className="pt-8 border-t border-border/30 mt-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">
                    Ready to take the next step?
                  </p>
                  {job.applicationDeadline && (
                    <p className="text-xs text-destructive mt-1">
                      Application closes on {new Date(job.applicationDeadline).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
                <Button asChild size="lg" className="px-8">
                  <Link to={`/apply/${jobId}`}>
                    Apply Now
                    <TrendingUp className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
