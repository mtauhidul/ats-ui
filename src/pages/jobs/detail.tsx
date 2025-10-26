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
  Building2,
  TrendingUp,
  CheckCircle2,
  Upload,
  FileText,
  X,
} from "lucide-react";
import type { Job } from "@/types/job";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export default function JobDetailPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
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

  const formatSalary = (salary?: { min: number; max: number; currency: string; period: string }) => {
    if (!salary) return "Competitive";
    const format = (num: number) => new Intl.NumberFormat("en-US").format(num);
    return `${salary.currency} ${format(salary.min)} - ${format(salary.max)} / ${salary.period}`;
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
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-6 py-12 md:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6 -ml-4">
            <Link to="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>

          {/* Job Header */}
          <Card className="border-border/50 shadow-xl mb-6">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {job.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-4 w-4" />
                          <span>{job.department || "Technology"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {job.location?.city}, {job.location?.country}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span className="capitalize">{job.type.replace("_", " ")}</span>
                        </div>
                      </div>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="lg" className="md:min-w-[150px]">
                          Apply Now
                        </Button>
                      </DialogTrigger>
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
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default" className="capitalize">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {job.experienceLevel}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {job.workMode}
                    </Badge>
                    <Badge variant="secondary">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {formatSalary(job.salaryRange)}
                    </Badge>
                    {job.openings > 1 && (
                      <Badge variant="secondary">{job.openings} Openings</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>About the Role</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {job.description}
                  </p>
                </CardContent>
              </Card>

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Key Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {job.responsibilities.map((responsibility, index) => (
                        <li key={index} className="flex gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      Experience Required
                    </h4>
                    <p className="text-muted-foreground">{job.requirements?.experience}</p>
                  </div>

                  {job.requirements?.skills?.required && job.requirements.skills.required.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.skills.required.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.requirements?.skills?.preferred && job.requirements.skills.preferred.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">
                        Preferred Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.skills.preferred.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Apply */}
              <Card className="border-border/50 bg-primary/5">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Ready to Apply?</h3>
                  <p className="text-sm text-muted-foreground">
                    Submit your application now and take the next step in your career
                  </p>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        Apply for this Position
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Job Summary */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Job Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Job Type</p>
                      <p className="text-sm font-medium capitalize">
                        {job.type.replace("_", " ")}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Work Mode</p>
                      <p className="text-sm font-medium capitalize">{job.workMode}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Experience Level</p>
                      <p className="text-sm font-medium capitalize">{job.experienceLevel}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Department</p>
                      <p className="text-sm font-medium">{job.department || "Technology"}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Openings</p>
                      <p className="text-sm font-medium">{job.openings} Position{job.openings > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
