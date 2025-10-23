import {
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconClockHour4,
  IconDotsVertical,
  IconDownload,
  IconFileText,
  IconFilter,
  IconArrowsSort,
  IconLayoutColumns,
  IconLoader,
  IconSearch,
  IconUserCheck,
  IconUsers,
  IconUserX,
  IconX,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import type { schema } from "./data-table-schema";

// Helper functions for status badges
function getStatusBadge(status: string) {
  switch (status) {
    case "Hired":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
          <IconCircleCheckFilled className="h-3 w-3 mr-1" />
          Hired
        </Badge>
      );
    case "Rejected":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
          <IconX className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
          <IconLoader className="h-3 w-3 mr-1" />
          In Process
        </Badge>
      );
  }
}

function getAIStatusBadge(type: string) {
  return (
    <Badge variant="secondary" className="text-xs">
      {type || "N/A"}
    </Badge>
  );
}

// Table cell viewer component
function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();
  const [showResumePreview, setShowResumePreview] = React.useState(false);
  const [showJobAssignDialog, setShowJobAssignDialog] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedJobId, setSelectedJobId] = React.useState("");
  
  // Mock jobs data - in real app, this would come from props or API
  const jobs = React.useMemo(() => [
    { id: "JOB-001", title: "Senior Software Engineer" },
    { id: "JOB-002", title: "Product Manager" },
    { id: "JOB-003", title: "UI/UX Designer" },
    { id: "JOB-004", title: "Data Scientist" },
    { id: "JOB-005", title: "DevOps Engineer" },
  ], []);

  const filteredJobs = React.useMemo(() => {
    if (!searchQuery) return jobs;
    const query = searchQuery.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.id.toLowerCase().includes(query)
    );
  }, [jobs, searchQuery]);

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      onOpenChange={(open) => {
        if (!open) {
          setShowJobAssignDialog(false);
          setSearchQuery("");
        }
      }}
    >
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.header}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[96vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle>Application Details</DrawerTitle>
          <DrawerDescription>
            Review and manage applicant information
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
          {/* Applicant Header Card */}
          <div className="flex items-start gap-4 rounded-lg border bg-muted/30 p-4">
            <Avatar className="h-14 w-14 border-2 rounded-lg">
              <AvatarImage src={item.photo || ""} className="object-cover" />
              <AvatarFallback className="text-base font-semibold">
                {item.header
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold mb-1">{item.header}</h3>
              {item.email && (
                <p className="text-sm text-muted-foreground truncate mb-0.5">
                  {item.email}
                </p>
              )}
              {item.phone && (
                <p className="text-xs text-muted-foreground">{item.phone}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {getStatusBadge(item.status)}
                {getAIStatusBadge(item.type)}
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-card p-3">
              <Label className="text-xs text-muted-foreground">
                Date Applied
              </Label>
              <p className="text-sm font-medium mt-1">
                {item.dateApplied || "N/A"}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <Label className="text-xs text-muted-foreground">Job ID</Label>
              <p className="text-sm font-medium font-mono mt-1">
                {item.type || "N/A"}
              </p>
            </div>
            <div className="rounded-lg border bg-lime-500/10 dark:bg-lime-500/10 border-lime-500/20 p-3">
              <Label className="text-xs text-lime-700 dark:text-lime-400 font-medium">
                Reviewer
              </Label>
              <p className="text-sm font-semibold text-lime-800 dark:text-lime-300 mt-1 truncate">
                {item.reviewer}
              </p>
            </div>
            {item.yearsOfExperience && (
              <div className="rounded-lg border bg-card p-3">
                <Label className="text-xs text-muted-foreground">
                  Experience
                </Label>
                <p className="text-sm font-medium mt-1">
                  {item.yearsOfExperience} years
                </p>
              </div>
            )}
          </div>

          {/* Professional Information */}
          {(item.currentTitle ||
            item.currentCompany ||
            item.educationLevel ||
            item.expectedSalary) && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                Professional Information
              </h4>
              <div className="rounded-lg border divide-y">
                {item.currentTitle && (
                  <div className="flex items-center justify-between p-3 text-sm">
                    <span className="text-muted-foreground">Position</span>
                    <span className="font-medium text-right">
                      {item.currentTitle}
                    </span>
                  </div>
                )}
                {item.currentCompany && (
                  <div className="flex items-center justify-between p-3 text-sm">
                    <span className="text-muted-foreground">Company</span>
                    <span className="font-medium text-right">
                      {item.currentCompany}
                    </span>
                  </div>
                )}
                {item.educationLevel && (
                  <div className="flex items-center justify-between p-3 text-sm">
                    <span className="text-muted-foreground">Education</span>
                    <span className="font-medium text-right">
                      {item.educationLevel}
                    </span>
                  </div>
                )}
                {item.expectedSalary && (
                  <div className="flex items-center justify-between p-3 text-sm">
                    <span className="text-muted-foreground">
                      Salary Expectation
                    </span>
                    <span className="font-medium text-right">
                      {item.expectedSalary}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(item.location || item.linkedinUrl || item.portfolioUrl) && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Contact Information</h4>
              <div className="rounded-lg border divide-y">
                {item.location && (
                  <div className="flex items-center justify-between p-3 text-sm">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium text-right">
                      {item.location}
                    </span>
                  </div>
                )}
                {item.linkedinUrl && (
                  <div className="flex items-center justify-between p-3 text-sm">
                    <span className="text-muted-foreground">LinkedIn</span>
                    <a
                      href={item.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      View Profile
                    </a>
                  </div>
                )}
                {item.portfolioUrl && (
                  <div className="flex items-center justify-between p-3 text-sm">
                    <span className="text-muted-foreground">Portfolio</span>
                    <a
                      href={item.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      View Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills & Languages */}
          {((item.skills && item.skills.length > 0) ||
            (item.languages && item.languages.length > 0)) && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Skills & Languages</h4>
              <div className="rounded-lg border bg-card p-4 space-y-3">
                {item.skills && item.skills.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Technical Skills
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {item.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {item.languages && item.languages.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Languages
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {item.languages.map((language, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs font-normal"
                        >
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents Section */}
          {(item.resumeFilename || item.coverLetter) && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Documents</h4>
              <div className="space-y-3">
                {/* Resume */}
                {item.resumeFilename && (
                  <div className="rounded-lg border overflow-hidden">
                    <div className="flex items-center justify-between gap-3 p-3 bg-muted/50">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="rounded-md bg-background p-2 border">
                          <IconFileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {item.resumeFilename}
                          </p>
                          {item.resumeFileSize && (
                            <p className="text-xs text-muted-foreground">
                              {item.resumeFileSize}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowResumePreview(!showResumePreview)
                          }
                          className="h-8 px-3"
                        >
                          <span className="text-xs">
                            {showResumePreview ? "Hide" : "View"}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            if (item.resumeFilename) {
                              const link = document.createElement("a");
                              link.href = `/uploads/resumes/${item.resumeFilename}`;
                              link.download = item.resumeFilename;
                              link.click();
                            }
                          }}
                          title="Download Resume"
                        >
                          <IconDownload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {showResumePreview && (
                      <div className="border-t">
                        {item.resumeFilename.toLowerCase().endsWith(".pdf") ? (
                          <div className="relative bg-muted/30">
                            <iframe
                              src={`/uploads/resumes/${item.resumeFilename}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                              className="w-full h-[500px]"
                              title="Resume Preview"
                              onError={(e) => {
                                console.error("PDF preview failed:", e);
                                (e.target as HTMLIFrameElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                        ) : item.resumeText ? (
                          <div className="max-h-[500px] overflow-y-auto p-4 bg-muted/30">
                            <pre className="text-xs whitespace-pre-wrap leading-relaxed">
                              {item.resumeText}
                            </pre>
                          </div>
                        ) : (
                          <div className="p-12 text-center bg-muted/30">
                            <IconFileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground mb-1">
                              Preview not available
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Download the file to view
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Cover Letter */}
                {item.coverLetter && (
                  <div className="rounded-lg border overflow-hidden">
                    <div className="px-4 py-2.5 bg-muted/50 border-b">
                      <Label className="text-xs font-medium">
                        Cover Letter
                      </Label>
                    </div>
                    <div className="p-4 max-h-64 overflow-y-auto bg-card">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {item.coverLetter}
                      </p>
                    </div>
                  </div>
                )}

                {/* Video Introduction */}
                {item.videoIntroUrl && (
                  <div className="rounded-lg border overflow-hidden">
                    <div className="px-4 py-2.5 bg-muted/50 border-b flex items-center justify-between">
                      <Label className="text-xs font-medium">
                        Video Introduction
                      </Label>
                      {(item.videoIntroDuration || item.videoIntroFileSize) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {item.videoIntroDuration && (
                            <span>{item.videoIntroDuration}</span>
                          )}
                          {item.videoIntroFileSize && (
                            <span>• {item.videoIntroFileSize}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="bg-black">
                      <video
                        controls
                        className="w-full max-h-80"
                        preload="metadata"
                        poster={item.photo || undefined}
                      >
                        <source src={item.videoIntroUrl} type="video/mp4" />
                        <source src={item.videoIntroUrl} type="video/webm" />
                        <source src={item.videoIntroUrl} type="video/ogg" />
                      </video>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Application Notes */}
          {item.notes && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Notes</h4>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm leading-relaxed">{item.notes}</p>
              </div>
            </div>
          )}

          {/* Resume Full Text */}
          {item.resumeText && !showResumePreview && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Resume Full Text</h4>
              <div className="rounded-lg border bg-muted/30 p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed text-muted-foreground">
                  {item.resumeText}
                </pre>
              </div>
            </div>
          )}
        </div>

        <DrawerFooter className="border-t gap-2">
          {showJobAssignDialog ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-select" className="text-sm font-semibold">
                  Assign to Job <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  {item.jobIdDisplay && item.jobIdDisplay !== "-"
                    ? `Current assignment: ${item.jobIdDisplay}. You can change it below.`
                    : "Select a job to assign this application to"}
                </p>

                {/* Search Input */}
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search jobs by title or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Jobs List */}
                <div className="border rounded-md max-h-[200px] overflow-y-auto">
                  {filteredJobs.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {searchQuery
                        ? "No jobs found matching your search"
                        : "No jobs available"}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredJobs.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => setSelectedJobId(job.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                            selectedJobId === job.id
                              ? "bg-primary/10 border-l-2 border-l-primary"
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {job.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ID: {job.id}
                              </div>
                            </div>
                            {selectedJobId === job.id && (
                              <IconCircleCheckFilled className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedJobId && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-md">
                    <IconCircleCheckFilled className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      Selected:{" "}
                      {jobs.find((j) => j.id === selectedJobId)?.title ||
                        selectedJobId}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (!selectedJobId) {
                      alert("Please select a job before approving");
                      return;
                    }
                    const selectedJob = jobs.find(
                      (j) => j.id === selectedJobId
                    );
                    console.log(
                      `Approving application for ${item.header} and assigning to job: ${selectedJobId}`
                    );
                    setShowJobAssignDialog(false);
                    // In real app, this would update the backend
                    alert(
                      `Application approved and assigned to:\n${selectedJob?.title} (${selectedJobId})`
                    );
                  }}
                  className="flex-1"
                  size="default"
                  disabled={!selectedJobId}
                >
                  <IconCheck className="h-4 w-4 mr-2" />
                  Confirm Approval
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowJobAssignDialog(false);
                    setSearchQuery("");
                  }}
                  className="flex-1"
                  size="default"
                >
                  <IconX className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  // Pre-select the current job if it exists
                  if (item.jobIdDisplay && item.jobIdDisplay !== "-") {
                    setSelectedJobId(item.jobIdDisplay);
                  } else {
                    setSelectedJobId("");
                  }
                  setShowJobAssignDialog(true);
                }}
                className="flex-1"
                size="default"
                disabled={item.status === "Done"}
              >
                <IconCheck className="h-4 w-4" />
                Approve
              </Button>
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log(`Rejecting application for ${item.header}`);
                  }}
                  className="flex-1"
                  size="default"
                  disabled={item.status === "Rejected"}
                >
                  <IconX className="h-4 w-4" />
                  Reject
                </Button>
              </DrawerClose>
            </div>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "candidateName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0"
        >
          Name
          {column.getIsSorted() === "asc" ? (
            <IconChevronDown className="ml-1 h-3 w-3 rotate-180" />
          ) : column.getIsSorted() === "desc" ? (
            <IconChevronDown className="ml-1 h-3 w-3" />
          ) : null}
        </Button>
      );
    },
    accessorFn: (row) => row.header,
    cell: ({ row }) => {
      return (
        <div className="w-48">
          <TableCellViewer item={row.original} />
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0"
        >
          Job ID
          {column.getIsSorted() === "asc" ? (
            <IconChevronDown className="ml-1 h-3 w-3 rotate-180" />
          ) : column.getIsSorted() === "desc" ? (
            <IconChevronDown className="ml-1 h-3 w-3" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="w-24">
        <span className="text-sm">{row.original.type}</span>
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0"
        >
          Status
          {column.getIsSorted() === "asc" ? (
            <IconChevronDown className="ml-1 h-3 w-3 rotate-180" />
          ) : column.getIsSorted() === "desc" ? (
            <IconChevronDown className="ml-1 h-3 w-3" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="w-32">
        <Badge
          variant="outline"
          className="text-muted-foreground px-2 py-1 flex items-center gap-1"
        >
          {row.original.status === "Hired" ? (
            <>
              <IconCircleCheckFilled className="size-3 fill-green-500 dark:fill-green-400" />
              Hired
            </>
          ) : row.original.status === "Rejected" ? (
            <>
              <span className="size-3 text-red-500">✕</span>
              Rejected
            </>
          ) : (
            <>
              <IconLoader className="size-3" />
              In Process
            </>
          )}
        </Badge>
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableHiding: true,
  },
  {
    accessorKey: "target",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0"
      >
        Stage
        {column.getIsSorted() === "asc" ? (
          <IconChevronDown className="ml-1 h-3 w-3 rotate-180" />
        ) : column.getIsSorted() === "desc" ? (
          <IconChevronDown className="ml-1 h-3 w-3" />
        ) : null}
      </Button>
    ),
    cell: ({ row }) => {
      const stage = row.original.dateApplied || "Not Started";

      // Define stage colors
      const getStageColor = (stage: string) => {
        switch (stage.toLowerCase()) {
          case "new application":
            return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800";
          case "screening":
            return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 border-purple-200 dark:border-purple-800";
          case "interview":
            return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800";
          case "assessment":
            return "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800";
          case "offer":
            return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800";
          case "hired":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
          default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
        }
      };

      return (
        <div className="text-left w-32">
          <Badge
            className={`px-2 py-1 text-xs font-medium ${getStageColor(stage)}`}
          >
            {stage}
          </Badge>
        </div>
      );
    },
    filterFn: (row, _id, value) => {
      return value.includes(row.original.dateApplied);
    },
    enableHiding: true,
  },
  {
    accessorKey: "limit",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0"
      >
        Client
        {column.getIsSorted() === "asc" ? (
          <IconChevronDown className="ml-1 h-3 w-3 rotate-180" />
        ) : column.getIsSorted() === "desc" ? (
          <IconChevronDown className="ml-1 h-3 w-3" />
        ) : null}
      </Button>
    ),
    cell: ({ row }) => {
      const clientName = row.original.jobIdDisplay || "-";
      const clientLogo = row.original.clientLogo;

      return (
        <div className="text-left w-40 flex items-center gap-2">
          {clientLogo && (
            <Avatar className="size-6 rounded">
              <AvatarImage src={clientLogo} alt={clientName} />
              <AvatarFallback className="text-xs rounded">
                {clientName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="text-sm truncate">{clientName}</span>
        </div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "reviewer",
    header: "Team",
    cell: ({ row }) => {
      const teamMembers = row.original.teamMembers || [];
      const hasTeamMembers = teamMembers.length > 0;

      return (
        <div className="w-48">
          {hasTeamMembers ? (
            <div className="flex flex-wrap gap-1">
              {teamMembers.slice(0, 2).map((member, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                >
                  {member}
                </Badge>
              ))}
              {teamMembers.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{teamMembers.length - 2}
                </Badge>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                console.log(`Assign team to candidate ${row.original.id}`);
              }}
            >
              Assign Team
            </Button>
          )}
        </div>
      );
    },
    enableHiding: true,
  },
  {
    id: "actions",
    cell: () => null,
    enableHiding: false,
  },
];

// Row actions column
const createActionsColumn = (handlers: {
  onHire: (id: number) => void;
  onReject: (id: number) => void;
  onAssignTeam: (id: number) => void;
  onDownloadResume: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<z.infer<typeof schema>> => ({
  id: "actions",
  cell: ({ row }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
          size="icon"
        >
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-xs font-semibold text-primary-foreground bg-primary">
          ID #{row.original.id}
        </div>
        <DropdownMenuItem
          onClick={() => handlers.onHire(row.original.id)}
          disabled={row.original.status === "Hired"}
        >
          <IconCheck className="h-3 w-3 mr-2 text-green-600" />
          Mark as Hired
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handlers.onReject(row.original.id)}
          disabled={row.original.status === "Rejected"}
        >
          <IconX className="h-3 w-3 mr-2 text-red-600" />
          Reject
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handlers.onAssignTeam(row.original.id)}
        >
          <IconUserCheck className="h-3 w-3 mr-2" />
          Assign Team Member
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handlers.onDownloadResume(row.original.id)}
        >
          <IconDownload className="h-3 w-3 mr-2" />
          Download Resume
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => handlers.onDelete(row.original.id)}
        >
          Delete Candidate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
});

export function CandidatesDataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Bulk action handlers
  const handleBulkHire = () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(r => r.original.id);
    setData(prevData => 
      prevData.map(item => 
        selectedIds.includes(item.id) ? { ...item, status: "Hired" } : item
      )
    );
    table.resetRowSelection();
  };

  const handleBulkReject = () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(r => r.original.id);
    setData(prevData => 
      prevData.map(item => 
        selectedIds.includes(item.id) ? { ...item, status: "Rejected" } : item
      )
    );
    table.resetRowSelection();
  };

  const handleBulkAssignTeam = () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(r => r.original.id);
    const teamMember = prompt("Enter team member name:");
    if (teamMember) {
      setData(prevData => 
        prevData.map(item => 
          selectedIds.includes(item.id) ? { ...item, reviewer: teamMember } : item
        )
      );
      table.resetRowSelection();
    }
  };

  const handleBulkExport = () => {
    const selectedData = table.getFilteredSelectedRowModel().rows.map(r => r.original);
    console.log("Exporting data:", selectedData);
    alert(`Exporting ${selectedData.length} candidates`);
  };

  // Individual action handlers
  const handleHire = (id: number) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, status: "Hired" } : item
      )
    );
  };

  const handleReject = (id: number) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, status: "Rejected" } : item
      )
    );
  };

  const handleAssignTeam = (id: number) => {
    const teamMember = prompt("Enter team member name:");
    if (teamMember) {
      setData((prevData) =>
        prevData.map((item) =>
          item.id === id ? { ...item, reviewer: teamMember } : item
        )
      );
    }
  };

  const handleDownloadResume = (id: number) => {
    const candidate = data.find((item) => item.id === id);
    if (candidate?.resumeFilename) {
      const link = document.createElement("a");
      link.href = `/uploads/resumes/${candidate.resumeFilename}`;
      link.download = candidate.resumeFilename;
      link.click();
    } else {
      alert("No resume file available");
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this candidate?")) {
      setData((prevData) => prevData.filter((item) => item.id !== id));
    }
  };

  const columnsWithActions = React.useMemo(() => {
    const baseColumns = columns.slice(0, -1);
    const actionsColumn = createActionsColumn({
      onHire: handleHire,
      onReject: handleReject,
      onAssignTeam: handleAssignTeam,
      onDownloadResume: handleDownloadResume,
      onDelete: handleDelete,
    });
    return [...baseColumns, actionsColumn];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const table = useReactTable({
    data,
    columns: columnsWithActions,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      
      const searchValue = String(filterValue).toLowerCase().trim();
      if (!searchValue) return true;

      const searchFields = [
        row.original.header,
        row.original.email,
        row.original.phone,
        row.original.status,
        row.original.reviewer,
        row.original.jobIdDisplay,
        row.original.currentTitle,
        row.original.currentCompany,
        row.original.type,
        row.original.dateApplied,
        row.original.location,
        row.original.educationLevel,
        ...(row.original.skills || []),
        ...(row.original.teamMembers || []),
        ...(row.original.languages || []),
      ];

      return searchFields.some((field) => {
        if (field == null) return false;
        return String(field).toLowerCase().includes(searchValue);
      });
    },
  });

  // Calculate statistics
  const filteredData = table
    .getFilteredRowModel()
    .rows.map((row) => row.original);
  const totalCandidates = filteredData.length;
  const hiredCount = filteredData.filter(
    (item) => item.status === "Hired"
  ).length;
  const rejectedCount = filteredData.filter(
    (item) => item.status === "Rejected"
  ).length;
  const inProcessCount = filteredData.filter(
    (item) => item.status === "In Process"
  ).length;

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border bg-gradient-to-br from-card to-muted/20 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="rounded-md bg-primary/10 p-1.5">
                <IconUsers className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Total
              </span>
            </div>
            <p className="text-xl font-bold">{totalCandidates}</p>
            <p className="text-xs text-muted-foreground">Candidates</p>
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-green-50 to-green-100/20 dark:from-green-950/20 dark:to-green-900/10 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="rounded-md bg-green-500/10 p-1.5">
                <IconUserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                Hired
              </span>
            </div>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {hiredCount}
            </p>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">
              {totalCandidates > 0
                ? Math.round((hiredCount / totalCandidates) * 100)
                : 0}
              % of total
            </p>
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-red-50 to-red-100/20 dark:from-red-950/20 dark:to-red-900/10 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="rounded-md bg-red-500/10 p-1.5">
                <IconUserX className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs font-medium text-red-700 dark:text-red-400">
                Rejected
              </span>
            </div>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {rejectedCount}
            </p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">
              {totalCandidates > 0
                ? Math.round((rejectedCount / totalCandidates) * 100)
                : 0}
              % of total
            </p>
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-amber-100/20 dark:from-amber-950/20 dark:to-amber-900/10 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="rounded-md bg-amber-500/10 p-1.5">
                <IconClockHour4 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Active
              </span>
            </div>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {inProcessCount}
            </p>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
              {totalCandidates > 0
                ? Math.round((inProcessCount / totalCandidates) * 100)
                : 0}
              % of total
            </p>
          </div>
        </div>

        {/* Search, Filter, Sort Bar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, job, company..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-sm rounded-md border bg-background shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Bulk Actions - Show when rows are selected */}
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <div className="flex items-center gap-2 mr-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
                <span className="text-sm font-medium">
                  {table.getFilteredSelectedRowModel().rows.length} selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      Actions
                      <IconChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleBulkHire}>
                      <IconCheck className="h-4 w-4 mr-2 text-green-600" />
                      Mark as Hired
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBulkReject}>
                      <IconX className="h-4 w-4 mr-2 text-red-600" />
                      Reject Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleBulkAssignTeam}>
                      <IconUserCheck className="h-4 w-4 mr-2" />
                      Assign Team
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBulkExport}>
                      <IconDownload className="h-4 w-4 mr-2" />
                      Export Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => table.resetRowSelection()}
                      className="text-muted-foreground"
                    >
                      Clear Selection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconFilter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                  {columnFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                      {columnFilters.length}
                    </Badge>
                  )}
                  <IconChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5 text-xs font-semibold">Filter by Status</div>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={!columnFilters.find(f => f.id === "status")}
                  onCheckedChange={() => {
                    setColumnFilters(prev => prev.filter(f => f.id !== "status"));
                  }}
                >
                  All Statuses
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnFilters.find(f => f.id === "status")?.value === "Hired"}
                  onCheckedChange={(checked) => {
                    setColumnFilters(prev => 
                      checked 
                        ? [...prev.filter(f => f.id !== "status"), { id: "status", value: "Hired" }]
                        : prev.filter(f => f.id !== "status")
                    );
                  }}
                >
                  <IconUserCheck className="h-3 w-3 mr-2 text-green-600" />
                  Hired
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnFilters.find(f => f.id === "status")?.value === "In Process"}
                  onCheckedChange={(checked) => {
                    setColumnFilters(prev => 
                      checked 
                        ? [...prev.filter(f => f.id !== "status"), { id: "status", value: "In Process" }]
                        : prev.filter(f => f.id !== "status")
                    );
                  }}
                >
                  <IconClockHour4 className="h-3 w-3 mr-2 text-amber-600" />
                  In Process
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnFilters.find(f => f.id === "status")?.value === "Rejected"}
                  onCheckedChange={(checked) => {
                    setColumnFilters(prev => 
                      checked 
                        ? [...prev.filter(f => f.id !== "status"), { id: "status", value: "Rejected" }]
                        : prev.filter(f => f.id !== "status")
                    );
                  }}
                >
                  <IconUserX className="h-3 w-3 mr-2 text-red-600" />
                  Rejected
                </DropdownMenuCheckboxItem>
                {columnFilters.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setColumnFilters([])}
                      className="text-destructive"
                    >
                      Clear All Filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconArrowsSort className="h-4 w-4" />
                  <span className="hidden sm:inline">Sort</span>
                  <IconChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSorting([{ id: "candidateName", desc: false }])}>
                  Name (A → Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSorting([{ id: "candidateName", desc: true }])}>
                  Name (Z → A)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSorting([{ id: "target", desc: true }])}>
                  Stage (Newest)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSorting([{ id: "target", desc: false }])}>
                  Stage (Oldest)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSorting([{ id: "status", desc: false }])}>
                  Status (A → Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSorting([{ id: "type", desc: false }])}>
                  Job ID (Low → High)
                </DropdownMenuItem>
                {sorting.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setSorting([])}
                      className="text-destructive"
                    >
                      Clear Sorting
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns />
                  <span className="hidden lg:inline">Columns</span>
                  <IconChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5 text-xs font-semibold">Toggle Columns</div>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={table.getColumn("candidateName")?.getIsVisible()}
                  onCheckedChange={(value) =>
                    table.getColumn("candidateName")?.toggleVisibility(!!value)
                  }
                >
                  Name
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={table.getColumn("type")?.getIsVisible()}
                  onCheckedChange={(value) =>
                    table.getColumn("type")?.toggleVisibility(!!value)
                  }
                >
                  Job ID
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={table.getColumn("status")?.getIsVisible()}
                  onCheckedChange={(value) =>
                    table.getColumn("status")?.toggleVisibility(!!value)
                  }
                >
                  Status
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={table.getColumn("target")?.getIsVisible()}
                  onCheckedChange={(value) =>
                    table.getColumn("target")?.toggleVisibility(!!value)
                  }
                >
                  Stage
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={table.getColumn("limit")?.getIsVisible()}
                  onCheckedChange={(value) =>
                    table.getColumn("limit")?.toggleVisibility(!!value)
                  }
                >
                  Client
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={table.getColumn("reviewer")?.getIsVisible()}
                  onCheckedChange={(value) =>
                    table.getColumn("reviewer")?.toggleVisibility(!!value)
                  }
                >
                  Team
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <TabsContent value="outline" className="m-0 border-0">
        <div className="rounded-lg border overflow-hidden mx-4 lg:mx-6">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No candidates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
