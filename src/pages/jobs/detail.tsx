import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import type { Job } from "@/types/job";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Extend Job type to match API response
type JobWithExtras = Job & {
  jobType?: string;
  locationType?: string;
  skills?: string[];
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
        setJob(jobData);
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Job not found</h2>
          <Button asChild>
            <Link to="/jobs">Back to Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-background border-b">
        <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Button variant="ghost" asChild className="mb-6 -ml-2">
              <Link to="/jobs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Link>
            </Button>

            {/* Job Title & Company */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {job.title}
                </h1>
                {job.experienceLevel && (
                  <p className="text-lg text-muted-foreground capitalize">
                    {job.experienceLevel} Level Position
                  </p>
                )}
              </div>

              {/* Key Info - Inline */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                {(job.location?.city || job.location?.country) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{[job.location?.city, job.location?.country].filter(Boolean).join(", ")}</span>
                  </div>
                )}

                {(job.type || job.jobType) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span className="capitalize">{(job.type || job.jobType).replace(/_/g, " ")}</span>
                  </div>
                )}

                {(job.workMode || job.locationType) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="capitalize">{job.workMode || job.locationType}</span>
                  </div>
                )}

                {job.experienceLevel && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="capitalize">{job.experienceLevel} Level</span>
                  </div>
                )}

                {job.openings > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{job.openings} {job.openings === 1 ? 'Opening' : 'Openings'}</span>
                  </div>
                )}
              </div>

              {/* Salary & Deadline */}
              <div className="flex flex-wrap items-center gap-4">
                {job.salaryRange && (
                  <div className="px-4 py-2 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">{formatSalary(job.salaryRange)}</span>
                    </div>
                  </div>
                )}
                {job.applicationDeadline && (
                  <div className="px-4 py-2 bg-destructive/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-destructive" />
                      <div>
                        <span className="text-xs text-muted-foreground mr-2">Apply by</span>
                        <span className="font-semibold text-foreground">
                          {new Date(job.applicationDeadline).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Description */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">About the Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </CardContent>
              </Card>

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">What You'll Do</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {job.responsibilities.map((responsibility, index) => (
                        <li key={index} className="flex gap-3 items-start">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {(job.requirements?.experience || 
                job.requirements?.education ||
                (job.requirements?.skills?.required && job.requirements.skills.required.length > 0) ||
                (job.requirements?.skills?.preferred && job.requirements.skills.preferred.length > 0) ||
                (job.requirements?.languages && job.requirements.languages.length > 0) ||
                (job.requirements?.certifications && job.requirements.certifications.length > 0)) && (
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">What We're Looking For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {job.requirements?.experience && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Experience</h4>
                        <p className="text-muted-foreground">{job.requirements.experience}</p>
                      </div>
                    )}

                    {job.requirements?.education && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Education</h4>
                        <p className="text-muted-foreground">{job.requirements.education}</p>
                      </div>
                    )}

                    {job.requirements?.skills?.required && job.requirements.skills.required.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Must-Have Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.skills.required.map((skill) => (
                            <Badge key={skill} variant="default">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {job.requirements?.skills?.preferred && job.requirements.skills.preferred.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Nice to Have</h4>
                        <div className="flex flex-wrap gap-2">
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
                        <h4 className="text-sm font-semibold text-foreground mb-2">Languages</h4>
                        <div className="flex flex-wrap gap-2">
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
                        <h4 className="text-sm font-semibold text-foreground mb-2">Certifications</h4>
                        <ul className="space-y-1.5">
                          {job.requirements.certifications.map((cert) => (
                            <li key={cert} className="flex items-center gap-2 text-muted-foreground">
                              <Award className="h-3.5 w-3.5 text-primary" />
                              <span className="text-sm">{cert}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Skills from Job Array */}
              {job.skills && job.skills.length > 0 && !(job.requirements?.skills?.required && job.requirements.skills.required.length > 0) && (
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Required Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="default" className="px-3 py-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {job.benefits && Array.isArray(job.benefits) && job.benefits.length > 0 && (
                <Card className="border shadow-sm bg-gradient-to-br from-primary/5 to-background">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">What We Offer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {job.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-background/80 rounded-lg border">
                          <Heart className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-sm font-medium">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <div className="lg:sticky lg:top-8">
                <Card className="border shadow-lg">
                  <CardContent className="p-6 text-center space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        Ready to Apply?
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Take the next step in your career
                      </p>
                    </div>
                    
                    <Button asChild size="lg" className="w-full">
                      <Link to={`/apply/${jobId}`}>
                        Apply Now
                      </Link>
                    </Button>

                    {job.applicationDeadline && (
                      <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Application Closes</p>
                        <p className="text-sm font-semibold text-destructive">
                          {new Date(job.applicationDeadline).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
