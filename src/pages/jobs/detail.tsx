import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle2,
  Upload,
  FileText,
  X,
  Calendar,
  Users,
  Award,
  Heart,
} from "lucide-react";
import type { Job } from "@/types/job";
import { toast } from "sonner";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedIn: "",
    portfolio: "",
    coverLetter: "",
    yearsOfExperience: "",
    currentCompany: "",
    currentPosition: "",
  });

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a PDF or Word document");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        return;
      }
      setResumeFile(file);
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    const fileInput = document.getElementById("resume") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!resumeFile) {
      toast.error("Please upload your resume");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    // Simulate API call
    try {
      // In a real app, you would upload the file and submit the form data
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.success("Application submitted successfully!");
      setDialogOpen(false);
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        linkedIn: "",
        portfolio: "",
        coverLetter: "",
        yearsOfExperience: "",
        currentCompany: "",
        currentPosition: "",
      });
      setResumeFile(null);
    } catch {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
          
          {/* Application Form Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Apply for {job.title}</DialogTitle>
                <DialogDescription>
                  Fill in your details to apply for this position
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                          {/* Personal Information */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="fullName">
                                  Full Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="fullName"
                                  name="fullName"
                                  value={formData.fullName}
                                  onChange={handleInputChange}
                                  placeholder="John Doe"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="email">
                                  Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  placeholder="john@example.com"
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="phone">
                                  Phone <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="phone"
                                  name="phone"
                                  type="tel"
                                  value={formData.phone}
                                  onChange={handleInputChange}
                                  placeholder="+1 (555) 123-4567"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                                <Input
                                  id="linkedIn"
                                  name="linkedIn"
                                  value={formData.linkedIn}
                                  onChange={handleInputChange}
                                  placeholder="https://linkedin.com/in/johndoe"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="portfolio">Portfolio / Website</Label>
                              <Input
                                id="portfolio"
                                name="portfolio"
                                value={formData.portfolio}
                                onChange={handleInputChange}
                                placeholder="https://johndoe.com"
                              />
                            </div>
                          </div>

                          <Separator />

                          {/* Professional Information */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground">Professional Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                                <Input
                                  id="yearsOfExperience"
                                  name="yearsOfExperience"
                                  type="number"
                                  value={formData.yearsOfExperience}
                                  onChange={handleInputChange}
                                  placeholder="5"
                                  min="0"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="currentCompany">Current Company</Label>
                                <Input
                                  id="currentCompany"
                                  name="currentCompany"
                                  value={formData.currentCompany}
                                  onChange={handleInputChange}
                                  placeholder="TechCorp Inc."
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="currentPosition">Current Position</Label>
                              <Input
                                id="currentPosition"
                                name="currentPosition"
                                value={formData.currentPosition}
                                onChange={handleInputChange}
                                placeholder="Senior Software Engineer"
                              />
                            </div>
                          </div>

                          <Separator />

                          {/* Resume Upload */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground">
                              Resume <span className="text-destructive">*</span>
                            </h3>
                            <div className="space-y-2">
                              {!resumeFile ? (
                                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                                  <Input
                                    id="resume"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="hidden"
                                  />
                                  <Label
                                    htmlFor="resume"
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                  >
                                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                                      <Upload className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium text-foreground">
                                        Click to upload resume
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        PDF, DOC, or DOCX (max 5MB)
                                      </p>
                                    </div>
                                  </Label>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-accent/5">
                                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {resumeFile.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {(resumeFile.size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemoveFile}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          <Separator />

                          {/* Cover Letter */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground">Cover Letter (Optional)</h3>
                            <div className="space-y-2">
                              <Textarea
                                id="coverLetter"
                                name="coverLetter"
                                value={formData.coverLetter}
                                onChange={handleInputChange}
                                placeholder="Tell us why you're a great fit for this position..."
                                rows={6}
                              />
                            </div>
                          </div>

                          {/* Submit Button */}
                          <div className="flex gap-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => setDialogOpen(false)}
                              disabled={submitting}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={submitting}>
                              {submitting ? "Submitting..." : "Submit Application"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

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
                    
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="lg" className="w-full">
                          Apply Now
                        </Button>
                      </DialogTrigger>
                    </Dialog>

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
