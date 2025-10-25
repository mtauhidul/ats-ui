import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Loader2, CheckCircle2, ArrowLeft, X, Eye, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ParsedCandidate {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  currentTitle: string;
  currentCompany: string;
  yearsOfExperience: number;
  educationLevel: string;
  skills: string[];
  summary: string;
  linkedinUrl: string;
  resumeUrl?: string;
}

export default function QuickImportPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCandidate | null>(null);
  const [formData, setFormData] = useState<ParsedCandidate>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    currentTitle: "",
    currentCompany: "",
    yearsOfExperience: 0,
    educationLevel: "",
    skills: [],
    summary: "",
    linkedinUrl: "",
    resumeUrl: "",
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a PDF or Word document");
        return;
      }
      setSelectedFile(file);
      setParsedData(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a PDF or Word document");
        return;
      }
      setSelectedFile(file);
      setParsedData(null);
    }
  };

  const handleUploadAndParse = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    setIsParsing(true);

    // Simulate upload and parsing with mock data
    setTimeout(() => {
      setIsUploading(false);

      const mockParsedData: ParsedCandidate = {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1 (555) 234-5678",
        location: "New York, NY",
        currentTitle: "Senior Product Manager",
        currentCompany: "TechStart Inc.",
        yearsOfExperience: 7,
        educationLevel: "Master's Degree",
        skills: [
          "Product Management",
          "Agile",
          "Scrum",
          "Roadmap Planning",
          "Stakeholder Management",
          "Data Analysis",
          "UX Design",
          "A/B Testing",
        ],
        summary:
          "Results-driven Product Manager with 7+ years of experience leading cross-functional teams to deliver innovative products. Proven track record of launching successful products that drive user engagement and revenue growth. Strong analytical skills combined with a deep understanding of user needs and market trends.",
        linkedinUrl: "https://linkedin.com/in/sarahjohnson",
        resumeUrl: URL.createObjectURL(selectedFile),
      };

      setParsedData(mockParsedData);
      setFormData(mockParsedData);
      setIsParsing(false);
      toast.success("Resume parsed successfully! Review the extracted information below.");
    }, 2500);
  };

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields (First Name, Last Name, Email)");
      return;
    }

    toast.success("Candidate imported successfully!");
    setTimeout(() => {
      navigate("/dashboard/candidates");
    }, 1000);
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skill.trim()] });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate("/dashboard/candidates")}
                  className="hover:bg-primary/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-foreground">Quick Import Candidate</h2>
                  <p className="text-muted-foreground mt-1">
                    Upload a resume and our AI will automatically extract candidate information
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-[500px_1fr] gap-6">
              {/* Left Column - Upload Section */}
              <div className="space-y-5">
                <Card className="border-primary/20">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" />
                      Upload Resume
                    </CardTitle>
                    <CardDescription>
                      Upload a PDF or Word document (max 5MB) to automatically extract candidate information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-10 transition-all duration-200 ${
                        selectedFile
                          ? "border-primary bg-gradient-to-b from-primary/10 to-primary/5"
                          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
                      }`}
                    >
                      {selectedFile ? (
                        <div className="text-center">
                          <div className="relative inline-block">
                            <FileText className="h-24 w-24 text-primary mx-auto mb-4" />
                            <CheckCircle2 className="h-8 w-8 text-primary absolute -top-2 -right-2 bg-background rounded-full" />
                          </div>
                          <p className="font-bold text-foreground text-lg mb-1">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                          <Badge variant="secondary" className="mb-4">
                            {selectedFile.type.includes("pdf") ? "PDF Document" : "Word Document"}
                          </Badge>
                          <div className="flex gap-2 justify-center mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedFile(null);
                                setParsedData(null);
                              }}
                              className="hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="h-24 w-24 text-muted-foreground mx-auto mb-6 opacity-60" />
                          <p className="font-bold text-foreground text-lg mb-6">
                            Drag & drop your resume here
                          </p>
                          <div className="flex justify-center mb-6">
                            <Label htmlFor="resume-upload">
                              <Button variant="default" size="lg" asChild className="cursor-pointer">
                                <span>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Browse Files
                                </span>
                              </Button>
                            </Label>
                          </div>
                          <Input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={handleFileSelect}
                          />
                          <p className="text-xs text-muted-foreground">
                            Supported: <strong>PDF, DOC, DOCX</strong> • Max size: <strong>5MB</strong>
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedFile && !parsedData && (
                      <Button
                        onClick={handleUploadAndParse}
                        disabled={isUploading || isParsing}
                        className="w-full mt-6 h-12"
                        size="lg"
                      >
                        {isParsing ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                            Parsing with AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Parse Resume with AI
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {parsedData && (
                  <Card className="border-accent/50 bg-gradient-to-br from-accent/10 to-accent/5">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-accent/20 p-2">
                          <CheckCircle2 className="h-6 w-6 text-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-accent-foreground text-lg mb-1">
                            Resume Parsed Successfully!
                          </p>
                          <p className="text-sm text-accent-foreground/80 mb-4">
                            We've extracted <strong>{formData.skills.length} skills</strong> and comprehensive
                            candidate information using AI. Review and edit the details before importing.
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="bg-background hover:bg-background/80">
                              <Eye className="h-4 w-4 mr-2" />
                              Preview Resume
                            </Button>
                            <Button variant="outline" size="sm" className="bg-background hover:bg-background/80">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Info Card */}
                {!parsedData && (
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        AI-Powered Extraction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Automatically extracts contact information</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Identifies skills and technologies</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Parses work experience and education</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Generates professional summary</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Form Section */}
              <Card className="border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Candidate Information
                  </CardTitle>
                  <CardDescription>
                    {parsedData
                      ? "Review and edit the extracted information before importing"
                      : "Upload a resume to see extracted candidate information"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {parsedData ? (
                    <div className="space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 pb-2 border-b">
                          Personal Information
                          <span className="text-xs text-red-500 font-normal">
                            (* required)
                          </span>
                        </h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">
                                First Name <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) =>
                                  setFormData({ ...formData, firstName: e.target.value })
                                }
                                placeholder="First name"
                              />
                            </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="lastName">
                                Last Name <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) =>
                                  setFormData({ ...formData, lastName: e.target.value })
                                }
                                placeholder="Last name"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@example.com"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1 (555) 123-4567"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={formData.location}
                              onChange={(e) =>
                                setFormData({ ...formData, location: e.target.value })
                              }
                              placeholder="City, State"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Professional Information */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">
                          Professional Information
                        </h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="currentTitle">Current Title</Label>
                              <Input
                                id="currentTitle"
                                value={formData.currentTitle}
                                onChange={(e) =>
                                  setFormData({ ...formData, currentTitle: e.target.value })
                                }
                                placeholder="Job title"
                              />
                            </div>
                            <div>
                              <Label htmlFor="currentCompany">Current Company</Label>
                              <Input
                                id="currentCompany"
                                value={formData.currentCompany}
                                onChange={(e) =>
                                  setFormData({ ...formData, currentCompany: e.target.value })
                                }
                                placeholder="Company name"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="experience">Years of Experience</Label>
                              <Input
                                id="experience"
                                type="number"
                                value={formData.yearsOfExperience}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    yearsOfExperience: parseInt(e.target.value) || 0,
                                  })
                                }
                                placeholder="0"
                                min="0"
                              />
                            </div>
                            <div>
                              <Label htmlFor="education">Education Level</Label>
                              <Select
                                value={formData.educationLevel}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, educationLevel: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="High School">High School</SelectItem>
                                  <SelectItem value="Associate's Degree">
                                    Associate's Degree
                                  </SelectItem>
                                  <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                                  <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                                  <SelectItem value="Doctorate">Doctorate</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Skills</h4>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {formData.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="pl-3 pr-1 py-1 text-sm"
                            >
                              {skill}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-2 hover:bg-transparent"
                                onClick={() => removeSkill(skill)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id="new-skill"
                            placeholder="Add a skill and press Enter"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                addSkill(e.currentTarget.value);
                                e.currentTarget.value = "";
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">
                          Additional Information
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="linkedin">LinkedIn URL</Label>
                            <Input
                              id="linkedin"
                              value={formData.linkedinUrl}
                              onChange={(e) =>
                                setFormData({ ...formData, linkedinUrl: e.target.value })
                              }
                              placeholder="https://linkedin.com/in/username"
                            />
                          </div>

                          <div>
                            <Label htmlFor="summary">Professional Summary</Label>
                            <Textarea
                              id="summary"
                              value={formData.summary}
                              onChange={(e) =>
                                setFormData({ ...formData, summary: e.target.value })
                              }
                              placeholder="Brief professional summary"
                              rows={5}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                    <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <FileText className="h-20 w-20 mx-auto mb-4 opacity-50" />
                        <p className="font-semibold text-lg mb-2">No Resume Uploaded</p>
                        <p className="text-sm">
                          Upload a resume on the left to see extracted information here
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Footer Actions */}
            {parsedData && (
              <div className="flex justify-end gap-3 mt-6 p-4 border-t bg-muted/30 rounded-lg">
                <Button variant="outline" onClick={() => navigate("/dashboard/candidates")}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} size="lg">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Import Candidate
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
