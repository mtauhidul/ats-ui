import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Client } from "@/types/client";
import type { Priority } from "@/types/common";
import type {
  CreateJobRequest,
  ExperienceLevel,
  JobType,
  WorkMode,
} from "@/types/job";
import {
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  ListChecks,
  Plus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AddJobModalProps {
  open: boolean;
  clients: Client[];
  onClose: () => void;
  onSubmit: (data: CreateJobRequest) => void;
  prefilledClientId?: string;
  hideClientSelector?: boolean;
}

export function AddJobModal({
  open,
  clients,
  onClose,
  onSubmit,
  prefilledClientId,
  hideClientSelector = false,
}: AddJobModalProps) {
  const [currentTab, setCurrentTab] = useState("basic");
  const [formData, setFormData] = useState<CreateJobRequest>({
    title: "",
    description: "",
    clientId: prefilledClientId || "",
    type: "full_time",
    experienceLevel: "mid",
    workMode: "hybrid",
    location: { city: "", country: "" },
    requirements: {
      experience: "",
      skills: {
        required: [],
        preferred: [],
      },
    },
    responsibilities: [],
    priority: "medium",
    openings: 1,
    recruiterIds: [],
    hiringManagerIds: [],
    categoryIds: [],
    tagIds: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync prefilledClientId when modal opens or clientId changes
  useEffect(() => {
    if (open && prefilledClientId) {
      setFormData((prev) => ({
        ...prev,
        clientId: prefilledClientId,
      }));
    }
  }, [open, prefilledClientId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // CRITICAL: Only allow submission from details tab
    if (currentTab !== "details") {
      return;
    }

    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Job description is required";
    }
    // Always validate clientId - it's required whether selector is hidden or not
    if (!formData.clientId) {
      newErrors.clientId = "Client is required";
      console.error("ClientId is missing:", {
        formData,
        prefilledClientId,
        hideClientSelector,
      });
    }
    if (!formData.location?.city?.trim()) {
      newErrors.locationCity = "City is required";
    }
    if (!formData.location?.country?.trim()) {
      newErrors.locationCountry = "Country is required";
    }
    if (!formData.requirements.experience.trim()) {
      newErrors.experience = "Experience requirement is required";
    }
    // Check for non-empty responsibilities
    const validResponsibilities = formData.responsibilities.filter((r) =>
      r.trim()
    );
    if (validResponsibilities.length === 0) {
      newErrors.responsibilities = "At least one responsibility is required";
    }
    // Check for non-empty required skills
    const validSkills = formData.requirements.skills.required.filter((s) =>
      s.trim()
    );
    if (validSkills.length === 0) {
      newErrors.requiredSkills = "At least one required skill is needed";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Navigate to the first tab with errors
      if (
        newErrors.title ||
        newErrors.description ||
        newErrors.clientId ||
        newErrors.locationCity ||
        newErrors.locationCountry
      ) {
        setCurrentTab("basic");
      } else if (
        newErrors.experience ||
        newErrors.responsibilities ||
        newErrors.requiredSkills
      ) {
        setCurrentTab("requirements");
      }
      return;
    }

    // Transform data to match backend schema
    const requiredSkills = formData.requirements.skills.required.filter((s) =>
      s.trim()
    );
    const experience = formData.requirements.experience.trim();

    // Backend expects requirements as string array
    // Store the experience description in requirements array
    const requirementsArray: string[] = [];
    if (experience) {
      requirementsArray.push(experience);
    }

    // Backend expects location as string, not Address object
    const locationString =
      typeof formData.location === "string"
        ? formData.location
        : `${formData.location?.city || ""}, ${
            formData.location?.country || ""
          }`.trim();

    const transformedData = {
      title: formData.title,
      description: formData.description,
      clientId: formData.clientId,
      jobType: formData.type, // Backend uses 'jobType' not 'type'
      experienceLevel: formData.experienceLevel,
      priority: formData.priority,
      status: "open", // Set status to 'open' so job is immediately available
      openings: formData.openings,
      requirements: requirementsArray,
      responsibilities: formData.responsibilities.filter((r) => r.trim()),
      skills: requiredSkills,
      location: locationString,
      locationType: formData.workMode, // Backend uses 'locationType' not 'workMode'
      salaryRange: formData.salaryRange,
      applicationDeadline: formData.applicationDeadline,
      categoryIds: formData.categoryIds || [],
      tagIds: formData.tagIds || [],
      recruiterIds: formData.recruiterIds || [],
    } as Record<string, unknown>;

    console.log("=== Submitting Job ===");
    console.log("Experience input value:", formData.requirements.experience);
    console.log("Requirements array being sent:", requirementsArray);
    console.log("Skills array being sent:", requiredSkills);
    console.log("Full transformed data:", transformedData);

    onSubmit(transformedData as unknown as CreateJobRequest);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      clientId: prefilledClientId || "",
      type: "full_time",
      experienceLevel: "mid",
      workMode: "hybrid",
      location: { city: "", country: "" },
      requirements: {
        experience: "",
        skills: {
          required: [],
          preferred: [],
        },
      },
      responsibilities: [],
      priority: "medium",
      openings: 1,
      recruiterIds: [],
      hiringManagerIds: [],
      categoryIds: [],
      tagIds: [],
    });
    setErrors({});
    setCurrentTab("basic");
    onClose();
  };

  const handleAddSkill = () => {
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements,
        skills: {
          ...formData.requirements.skills,
          required: [...formData.requirements.skills.required, ""],
        },
      },
    });
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...formData.requirements.skills.required];
    newSkills[index] = value;
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements,
        skills: {
          ...formData.requirements.skills,
          required: newSkills,
        },
      },
    });
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = formData.requirements.skills.required.filter(
      (_, i) => i !== index
    );
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements,
        skills: {
          ...formData.requirements.skills,
          required: newSkills,
        },
      },
    });
  };

  const handleAddResponsibility = () => {
    setFormData({
      ...formData,
      responsibilities: [...formData.responsibilities, ""],
    });
  };

  const handleResponsibilityChange = (index: number, value: string) => {
    const newResponsibilities = [...formData.responsibilities];
    newResponsibilities[index] = value;
    setFormData({
      ...formData,
      responsibilities: newResponsibilities,
    });
  };

  const handleRemoveResponsibility = (index: number) => {
    const newResponsibilities = formData.responsibilities.filter(
      (_, i) => i !== index
    );
    setFormData({
      ...formData,
      responsibilities: newResponsibilities,
    });
  };

  const handleNextStep = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const newErrors: Record<string, string> = {};

    // Validate current tab before proceeding
    if (currentTab === "basic") {
      if (!formData.title.trim()) {
        newErrors.title = "Job title is required";
      }
      if (!formData.description.trim()) {
        newErrors.description = "Job description is required";
      }
      // Always check clientId - show error only if selector is visible
      if (!formData.clientId) {
        if (!hideClientSelector) {
          newErrors.clientId = "Client is required";
        } else {
          console.error(
            "ClientId missing even though selector is hidden:",
            prefilledClientId
          );
        }
      }
      if (!formData.location?.city?.trim()) {
        newErrors.locationCity = "City is required";
      }
      if (!formData.location?.country?.trim()) {
        newErrors.locationCountry = "Country is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setCurrentTab("requirements");
    } else if (currentTab === "requirements") {
      if (!formData.requirements.experience.trim()) {
        newErrors.experience = "Experience requirement is required";
      }
      // Check for non-empty responsibilities
      const validResponsibilities = formData.responsibilities.filter((r) =>
        r.trim()
      );
      if (validResponsibilities.length === 0) {
        newErrors.responsibilities = "At least one responsibility is required";
      }
      // Check for non-empty required skills
      const validSkills = formData.requirements.skills.required.filter((s) =>
        s.trim()
      );
      if (validSkills.length === 0) {
        newErrors.requiredSkills = "At least one required skill is needed";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setCurrentTab("details");
    }

    // Clear errors when validation passes
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-5xl max-h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 border-b bg-linear-to-r from-primary/5 to-primary/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl md:text-2xl font-bold">
                Create New Job
              </DialogTitle>
              <DialogDescription className="text-xs md:text-sm text-muted-foreground mt-1">
                Fill in the job details to post a new position
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            // Prevent Enter key from submitting unless on details tab
            if (e.key === "Enter" && currentTab !== "details") {
              e.preventDefault();
            }
          }}
          className="flex flex-col flex-1 min-h-0"
        >
          <Tabs value={currentTab} className="flex flex-col flex-1 min-h-0">
            <div className="px-4 md:px-6 pt-4 border-b shrink-0">
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <TabsList className="h-11 p-1 bg-card border border-border mb-4 w-full md:w-fit inline-flex">
                  <TabsTrigger
                    value="basic"
                    disabled
                    className="flex-1 md:flex-initial px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground cursor-default text-xs md:text-sm"
                  >
                    <FileText className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Basic Info</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="requirements"
                    disabled
                    className="flex-1 md:flex-initial px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground cursor-default text-xs md:text-sm"
                  >
                    <ListChecks className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Requirements</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    disabled
                    className="flex-1 md:flex-initial px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground cursor-default text-xs md:text-sm"
                  >
                    <DollarSign className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Details</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="px-4 md:px-6 py-4 md:py-6">
                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-6 mt-0">
                  {/* Client Selection */}
                  {!hideClientSelector && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary" />
                            <Label
                              htmlFor="clientId"
                              className="text-base font-semibold"
                            >
                              Client <span className="text-red-500">*</span>
                            </Label>
                          </div>
                          <Select
                            value={formData.clientId}
                            onValueChange={(value) => {
                              setFormData({ ...formData, clientId: value });
                              if (errors.clientId)
                                setErrors({ ...errors, clientId: "" });
                            }}
                          >
                            <SelectTrigger
                              className={`h-11 ${
                                errors.clientId ? "border-red-500" : ""
                              }`}
                            >
                              <SelectValue placeholder="Select a client company" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    {client.companyName}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.clientId && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <span className="text-xs">⚠</span>{" "}
                              {errors.clientId}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Job Title & Description */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="title"
                        className="text-base font-semibold"
                      >
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
                        className={`h-11 ${
                          errors.title ? "border-red-500" : ""
                        }`}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span className="text-xs">⚠</span> {errors.title}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-base font-semibold"
                      >
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
                          <span className="text-xs">⚠</span>{" "}
                          {errors.description}
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
                            <SelectItem value="internship">
                              Internship
                            </SelectItem>
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

                  {/* Location */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">
                      Location Details
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="location-city"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="location-city"
                          value={formData.location?.city || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: {
                                ...(formData.location || {
                                  city: "",
                                  country: "",
                                }),
                                city: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g., San Francisco"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="location-country"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Country <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="location-country"
                          value={formData.location?.country || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: {
                                ...(formData.location || {
                                  city: "",
                                  country: "",
                                }),
                                country: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g., USA"
                          className="h-11"
                        />
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
                      Experience Required{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="experience"
                        value={formData.requirements.experience}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            requirements: {
                              ...formData.requirements,
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
                    <Label className="text-base font-semibold">
                      Required Skills <span className="text-red-500">*</span>
                    </Label>

                    <Card className="border-dashed">
                      <CardContent className="p-4">
                        {formData.requirements.skills.required.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <ListChecks className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No skills added yet</p>
                            <p className="text-xs mt-1">
                              Click "Add Skill" below to add required skills
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {formData.requirements.skills.required.map(
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
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddSkill}
                          className="w-full mt-3"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Skill
                        </Button>
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
                    <Label className="text-base font-semibold">
                      Key Responsibilities{" "}
                      <span className="text-red-500">*</span>
                    </Label>

                    <Card className="border-dashed">
                      <CardContent className="p-4">
                        {formData.responsibilities.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">
                              No responsibilities added yet
                            </p>
                            <p className="text-xs mt-1">
                              Click "Add Responsibility" below to add key
                              responsibilities
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {formData.responsibilities.map((resp, index) => (
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
                                  onClick={() =>
                                    handleRemoveResponsibility(index)
                                  }
                                  className="h-10 w-10 p-0 opacity-50 hover:opacity-100 hover:bg-red-50 hover:text-red-600 shrink-0 mt-1"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddResponsibility}
                          className="w-full mt-3"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Responsibility
                        </Button>
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
                                    period:
                                      formData.salaryRange?.period || "yearly",
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
                                    period:
                                      formData.salaryRange?.period || "yearly",
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
          <div className="border-t px-4 md:px-6 py-3 md:py-4 bg-muted/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            <div className="text-xs md:text-sm text-muted-foreground text-center sm:text-left">
              {currentTab === "basic" && "Step 1 of 3: Basic Information"}
              {currentTab === "requirements" && "Step 2 of 3: Requirements"}
              {currentTab === "details" && "Step 3 of 3: Additional Details"}
            </div>
            <div className="flex gap-2 md:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 sm:flex-initial text-xs md:text-sm"
              >
                Cancel
              </Button>
              {currentTab !== "basic" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (currentTab === "requirements") setCurrentTab("basic");
                    else if (currentTab === "details")
                      setCurrentTab("requirements");
                  }}
                  className="flex-1 sm:flex-initial text-xs md:text-sm"
                >
                  Back
                </Button>
              )}
              {currentTab !== "details" ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 sm:flex-initial text-xs md:text-sm"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 sm:flex-initial sm:min-w-[120px] text-xs md:text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
