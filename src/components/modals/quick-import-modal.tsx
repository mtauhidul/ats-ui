import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface QuickImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
}

export function QuickImportModal({ open, onOpenChange }: QuickImportModalProps) {
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
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a PDF or Word document");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadAndParse = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    setIsParsing(true);

    // Simulate upload and parsing
    setTimeout(() => {
      setIsUploading(false);

      // Mock parsed data from backend
      const mockParsedData: ParsedCandidate = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        currentTitle: "Senior Software Engineer",
        currentCompany: "Tech Corp Inc.",
        yearsOfExperience: 5,
        educationLevel: "Bachelor's Degree",
        skills: ["JavaScript", "React", "Node.js", "TypeScript", "AWS"],
        summary: "Experienced software engineer with 5+ years of building scalable web applications. Strong expertise in React, Node.js, and cloud technologies.",
        linkedinUrl: "https://linkedin.com/in/johndoe",
      };

      setParsedData(mockParsedData);
      setFormData(mockParsedData);
      setIsParsing(false);
      toast.success("Resume parsed successfully!");
    }, 2000);
  };

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success("Candidate imported successfully!");
    onOpenChange(false);

    // Reset state
    setSelectedFile(null);
    setParsedData(null);
    setFormData({
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
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedFile(null);
    setParsedData(null);
    setFormData({
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
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Quick Import Candidate</DialogTitle>
          <DialogDescription>
            Upload a resume and review the extracted information before importing
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 divide-x h-[calc(90vh-180px)]">
          {/* Left Column - Import Section */}
          <div className="p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Resume
              </h3>
              <p className="text-sm text-muted-foreground">
                Upload a PDF or Word document to automatically extract candidate information
              </p>
            </div>

            {/* File Upload Area */}
            <div className="flex-1 flex flex-col">
              <div
                className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors ${
                  selectedFile ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              >
                {selectedFile ? (
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
                    <p className="font-medium text-foreground mb-1">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setParsedData(null);
                      }}
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium text-foreground mb-2">
                      Drop your resume here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      PDF or Word documents, max 5MB
                    </p>
                    <Label htmlFor="resume-upload">
                      <Button variant="outline" size="sm" asChild>
                        <span>Select File</span>
                      </Button>
                    </Label>
                    <Input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                )}
              </div>

              {selectedFile && !parsedData && (
                <div className="mt-4">
                  <Button
                    onClick={handleUploadAndParse}
                    disabled={isUploading || isParsing}
                    className="w-full"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Parsing Resume...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload & Parse Resume
                      </>
                    )}
                  </Button>
                </div>
              )}

              {parsedData && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-medium">Resume parsed successfully!</p>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Review and edit the extracted information on the right
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Parsed Data Form */}
          <div className="p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Candidate Information
              </h3>
              <p className="text-sm text-muted-foreground">
                {parsedData ? "Review and edit the extracted information" : "Parsed data will appear here after upload"}
              </p>
            </div>

            {parsedData ? (
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
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
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, State"
                    />
                  </div>

                  {/* Current Position */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentTitle">Current Title</Label>
                      <Input
                        id="currentTitle"
                        value={formData.currentTitle}
                        onChange={(e) => setFormData({ ...formData, currentTitle: e.target.value })}
                        placeholder="Job title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentCompany">Current Company</Label>
                      <Input
                        id="currentCompany"
                        value={formData.currentCompany}
                        onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                        placeholder="Company name"
                      />
                    </div>
                  </div>

                  {/* Experience and Education */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={formData.yearsOfExperience}
                        onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="education">Education Level</Label>
                      <Select
                        value={formData.educationLevel}
                        onValueChange={(value) => setFormData({ ...formData, educationLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High School">High School</SelectItem>
                          <SelectItem value="Associate's Degree">Associate's Degree</SelectItem>
                          <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                          <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                          <SelectItem value="Doctorate">Doctorate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <Label htmlFor="skills">Skills</Label>
                    <Input
                      id="skills"
                      value={formData.skills.join(", ")}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(",").map(s => s.trim()) })}
                      placeholder="JavaScript, React, Node.js"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Comma-separated values</p>
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  {/* Summary */}
                  <div>
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea
                      id="summary"
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      placeholder="Brief professional summary"
                      rows={4}
                    />
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No data parsed yet</p>
                  <p className="text-sm mt-1">Upload a resume to see extracted information</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!parsedData}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Import Candidate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
