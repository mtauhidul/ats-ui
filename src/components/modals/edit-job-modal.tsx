import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type {
  Job,
  UpdateJobRequest,
  JobType,
  JobStatus,
  ExperienceLevel,
  WorkMode,
} from "@/types/job";
import type { Priority } from "@/types/common";
import type { Client } from "@/types/client";
import {
  Plus,
  X,
  Briefcase,
  ListChecks,
  FileText,
  Building2,
  DollarSign,
  Calendar,
  Users,
  Save,
} from "lucide-react";

interface EditJobModalProps {
  open: boolean;
  job: Job;
  clients: Client[];
  onClose: () => void;
  onSubmit: (id: string, data: UpdateJobRequest) => void;
}

export function EditJobModal({
  open,
  job,
  clients,
  onClose,
  onSubmit,
}: EditJobModalProps) {
  const [currentTab, setCurrentTab] = useState("basic");
  const [formData, setFormData] = useState<UpdateJobRequest>({
    title: job.title,
    description: job.description,
    status: job.status,
    type: job.type,
    experienceLevel: job.experienceLevel,
    workMode: job.workMode,
    requirements: job.requirements,
    responsibilities: job.responsibilities,
    priority: job.priority,
    openings: job.openings,
    department: job.department,
    salaryRange: job.salaryRange,
    applicationDeadline: job.applicationDeadline,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when job changes
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        description: job.description,
        status: job.status,
        type: job.type,
        experienceLevel: job.experienceLevel,
        workMode: job.workMode,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        priority: job.priority,
        openings: job.openings,
        department: job.department,
        salaryRange: job.salaryRange,
        applicationDeadline: job.applicationDeadline,
      });
    }
  }, [job]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.title?.trim()) {
      newErrors.title = "Job title is required";
    }
    if (!formData.description?.trim()) {
      newErrors.description = "Job description is required";
    }
    if (!formData.requirements?.experience?.trim()) {
      newErrors.experience = "Experience requirement is required";
    }
    if (formData.responsibilities && formData.responsibilities.length === 0) {
      newErrors.responsibilities = "At least one responsibility is required";
    }
    if (
      formData.requirements?.skills?.required &&
      formData.requirements.skills.required.length === 0
    ) {
      newErrors.requiredSkills = "At least one required skill is needed";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(job.id, formData);
    handleClose();
  };

  const handleClose = () => {
    setErrors({});
    setCurrentTab("basic");
    onClose();
  };

  const handleAddSkill = () => {
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements!,
        skills: {
          ...formData.requirements!.skills,
          required: [...(formData.requirements?.skills?.required || []), ""],
        },
      },
    });
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...(formData.requirements?.skills?.required || [])];
    newSkills[index] = value;
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements!,
        skills: {
          ...formData.requirements!.skills,
          required: newSkills,
        },
      },
    });
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = (formData.requirements?.skills?.required || []).filter(
      (_, i) => i !== index
    );
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements!,
        skills: {
          ...formData.requirements!.skills,
          required: newSkills,
        },
      },
    });
  };

  const handleAddResponsibility = () => {
    setFormData({
      ...formData,
      responsibilities: [...(formData.responsibilities || []), ""],
    });
  };

  const handleResponsibilityChange = (index: number, value: string) => {
    const newResponsibilities = [...(formData.responsibilities || [])];
    newResponsibilities[index] = value;
    setFormData({
      ...formData,
      responsibilities: newResponsibilities,
    });
  };

  const handleRemoveResponsibility = (index: number) => {
    const newResponsibilities = (formData.responsibilities || []).filter(
      (_, i) => i !== index
    );
    setFormData({
      ...formData,
      responsibilities: newResponsibilities,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Edit Job</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Update the job details
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0"
        >
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="px-6 pt-4 border-b flex-shrink-0">
              <TabsList className="h-11 p-1 bg-card border border-border mb-4 w-full md:w-fit">
                <TabsTrigger
                  value="basic"
                  className="flex-1 md:flex-initial px-4 md:px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-sm md:text-base">Basic Info</span>
                </TabsTrigger>
                <TabsTrigger
                  value="requirements"
                  className="flex-1 md:flex-initial px-4 md:px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                >
                  <ListChecks className="h-4 w-4 mr-2" />
                  <span className="text-sm md:text-base">Requirements</span>
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="flex-1 md:flex-initial px-4 md:px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span className="text-sm md:text-base">Details</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="px-6 py-6">
                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-6 mt-0">
                  {/* Client Info - Read Only */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <Label className="text-base font-semibold">Client</Label>
                        </div>
                        <div className="flex items-center gap-2 h-11 px-3 rounded-md border border-input bg-muted/50">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {clients?.find((c) => c.id === job.clientId)?.companyName ||
                              "Unknown Client"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Client cannot be changed after job creation
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Job Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-base font-semibold">
                      Job Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: JobStatus) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Job Title & Description */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-base font-semibold">
                        Job Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({ ...formData, title: e.target.value });
                          if (errors.title) setErrors({ ...errors, title: "" });
                        }}
                        placeholder="e.g., Senior Software Engineer"
                        className={`h-11 ${errors.title ? "border-red-500" : ""}`}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span className="text-xs">⚠</span> {errors.title}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-base font-semibold">
                        Job Description <span className="text-red-500">*</span>
                      </Label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          });
                          if (errors.description)
                            setErrors({ ...errors, description: "" });
                        }}
                        placeholder="Provide a detailed description of the job role, expectations, and what you're looking for..."
                        rows={6}
                        className={`flex w-full rounded-md border ${
                          errors.description ? "border-red-500" : "border-input"
                        } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none`}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span className="text-xs">⚠</span> {errors.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Job Type, Experience Level, Work Mode */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">
                      Employment Details
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="type"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Job Type
                        </Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value: JobType) =>
                            setFormData({ ...formData, type: value })
                          }
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full_time">Full Time</SelectItem>
                            <SelectItem value="part_time">Part Time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="freelance">Freelance</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                            <SelectItem value="temporary">Temporary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="experienceLevel"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Experience Level
                        </Label>
                        <Select
                          value={formData.experienceLevel}
                          onValueChange={(value: ExperienceLevel) =>
                            setFormData({ ...formData, experienceLevel: value })
                          }
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entry">Entry Level</SelectItem>
                            <SelectItem value="junior">Junior</SelectItem>
                            <SelectItem value="mid">Mid Level</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="workMode"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Work Mode
                        </Label>
                        <Select
                          value={formData.workMode}
                          onValueChange={(value: WorkMode) =>
                            setFormData({ ...formData, workMode: value })
                          }
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="remote">🏠 Remote</SelectItem>
                            <SelectItem value="onsite">🏢 Onsite</SelectItem>
                            <SelectItem value="hybrid">🔄 Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Priority and Openings */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">
                      Position Details
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="priority"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Priority
                        </Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value: Priority) =>
                            setFormData({ ...formData, priority: value })
                          }
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                Low
                              </div>
                            </SelectItem>
                            <SelectItem value="medium">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                Medium
                              </div>
                            </SelectItem>
                            <SelectItem value="high">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-orange-500" />
                                High
                              </div>
                            </SelectItem>
                            <SelectItem value="urgent">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                Urgent
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="openings"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Number of Openings
                        </Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="openings"
                            type="number"
                            min="1"
                            value={formData.openings}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                openings: parseInt(e.target.value) || 1,
                              })
                            }
                            className="h-11 pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Requirements Tab */}
                <TabsContent value="requirements" className="space-y-6 mt-0">
                  {/* Years of Experience */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="experience"
                      className="text-base font-semibold"
                    >
                      Experience Required <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="experience"
                        value={formData.requirements?.experience || ""}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            requirements: {
                              ...formData.requirements!,
                              experience: e.target.value,
                            },
                          });
                          if (errors.experience)
                            setErrors({ ...errors, experience: "" });
                        }}
                        placeholder="e.g., 3-5 years in software development"
                        className={`h-11 pl-10 ${
                          errors.experience ? "border-red-500" : ""
                        }`}
                      />
                    </div>
                    {errors.experience && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="text-xs">⚠</span> {errors.experience}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Describe the experience level required for this position
                    </p>
                  </div>

                  {/* Required Skills */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">
                        Required Skills <span className="text-red-500">*</span>
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddSkill}
                        className="h-8"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Skill
                      </Button>
                    </div>

                    <Card className="border-dashed">
                      <CardContent className="p-4">
                        {(formData.requirements?.skills?.required?.length || 0) === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <ListChecks className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No skills added yet</p>
                            <p className="text-xs mt-1">
                              Click "Add Skill" to add required skills
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {formData.requirements?.skills?.required?.map(
                              (skill, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 group"
                                >
                                  <div className="flex-1 relative">
                                    <Input
                                      value={skill}
                                      onChange={(e) =>
                                        handleSkillChange(index, e.target.value)
                                      }
                                      placeholder="e.g., React, TypeScript, Node.js"
                                      className="h-10 pr-8"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveSkill(index)}
                                    className="h-10 w-10 p-0 opacity-50 hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {errors.requiredSkills && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="text-xs">⚠</span>{" "}
                        {errors.requiredSkills}
                      </p>
                    )}
                  </div>

                  {/* Key Responsibilities */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">
                        Key Responsibilities{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddResponsibility}
                        className="h-8"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Responsibility
                      </Button>
                    </div>

                    <Card className="border-dashed">
                      <CardContent className="p-4">
                        {(formData.responsibilities?.length || 0) === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No responsibilities added yet</p>
                            <p className="text-xs mt-1">
                              Click "Add Responsibility" to add key responsibilities
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {formData.responsibilities?.map((resp, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 group"
                              >
                                <div className="flex-1">
                                  <textarea
                                    value={resp}
                                    onChange={(e) =>
                                      handleResponsibilityChange(
                                        index,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Describe a key responsibility..."
                                    rows={2}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveResponsibility(index)}
                                  className="h-10 w-10 p-0 opacity-50 hover:opacity-100 hover:bg-red-50 hover:text-red-600 flex-shrink-0 mt-1"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {errors.responsibilities && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="text-xs">⚠</span>{" "}
                        {errors.responsibilities}
                      </p>
                    )}
                  </div>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6 mt-0">
                  {/* Salary Range */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <Label className="text-base font-semibold">
                          Salary Range (Optional)
                        </Label>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="salaryMin"
                              className="text-sm font-medium text-muted-foreground"
                            >
                              Minimum ($)
                            </Label>
                            <Input
                              id="salaryMin"
                              type="number"
                              min="0"
                              value={formData.salaryRange?.min || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  salaryRange: {
                                    ...formData.salaryRange,
                                    min: parseInt(e.target.value) || 0,
                                    max: formData.salaryRange?.max || 0,
                                    currency:
                                      formData.salaryRange?.currency || "USD",
                                    period: formData.salaryRange?.period || "yearly",
                                  },
                                })
                              }
                              placeholder="50000"
                              className="h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="salaryMax"
                              className="text-sm font-medium text-muted-foreground"
                            >
                              Maximum ($)
                            </Label>
                            <Input
                              id="salaryMax"
                              type="number"
                              min="0"
                              value={formData.salaryRange?.max || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  salaryRange: {
                                    ...formData.salaryRange,
                                    min: formData.salaryRange?.min || 0,
                                    max: parseInt(e.target.value) || 0,
                                    currency:
                                      formData.salaryRange?.currency || "USD",
                                    period: formData.salaryRange?.period || "yearly",
                                  },
                                })
                              }
                              placeholder="80000"
                              className="h-11"
                            />
                          </div>
                        </div>

                        {formData.salaryRange?.min &&
                          formData.salaryRange?.max && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-md">
                              <span className="font-medium">Range:</span>
                              <Badge variant="secondary" className="font-mono">
                                ${formData.salaryRange.min.toLocaleString()} - $
                                {formData.salaryRange.max.toLocaleString()}
                              </Badge>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Department */}
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-base font-semibold">
                      Department (Optional)
                    </Label>
                    <Input
                      id="department"
                      value={formData.department || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      placeholder="e.g., Engineering, Marketing, Sales"
                      className="h-11"
                    />
                  </div>

                  {/* Application Deadline */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="applicationDeadline"
                      className="text-base font-semibold"
                    >
                      Application Deadline (Optional)
                    </Label>
                    <Input
                      id="applicationDeadline"
                      type="date"
                      value={
                        formData.applicationDeadline
                          ? new Date(formData.applicationDeadline)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          applicationDeadline: e.target.value
                            ? new Date(e.target.value)
                            : undefined,
                        })
                      }
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Set a deadline for accepting applications
                    </p>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>

          {/* Footer Actions */}
          <div className="border-t px-6 py-4 bg-muted/30 flex items-center justify-between flex-shrink-0">
            <div className="text-sm text-muted-foreground">
              {currentTab === "basic" && "Step 1 of 3: Basic Information"}
              {currentTab === "requirements" && "Step 2 of 3: Requirements"}
              {currentTab === "details" && "Step 3 of 3: Additional Details"}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {currentTab !== "details" ? (
                <Button
                  type="button"
                  onClick={() => {
                    if (currentTab === "basic") setCurrentTab("requirements");
                    else if (currentTab === "requirements")
                      setCurrentTab("details");
                  }}
                >
                  Next Step
                </Button>
              ) : (
                <Button type="submit" className="min-w-[120px]">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
