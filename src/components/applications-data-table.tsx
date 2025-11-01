import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconCheck,
  IconX,
  IconClock,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconDownload,
  IconEye,
  IconUser,
  IconFileText,
  IconRobot,
  IconTrash,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,

} from "@tanstack/react-table";
import * as React from "react";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Application interface
interface Application {
  id: string;
  jobId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  photo?: string | null;
  status: "pending" | "approved" | "rejected";
  source: string;
  currentTitle: string;
  currentCompany: string;
  yearsOfExperience?: number; // Optional - may not be calculated
  skills: string[];
  linkedInUrl?: string;
  portfolioUrl?: string;
  submittedAt: string;
  lastUpdated: string;
  coverLetter: string;
  resume?: {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
  } | null;
  resumeText: string;
  resumeUrl?: string; // Direct URL to resume file
  resumeFilename?: string; // Original filename
  reviewedBy: string;
  aiAnalysis: {
    isValid: boolean;
    summary: string;
  };
  parsedData?: { // For fallback experience calculation
    experience?: Array<{
      company: string;
      title: string;
      duration: string;
      description?: string;
    }>;
  };
}

interface ApplicationsDataTableProps {
  data: Application[];
}

function SortableRow({
  row,
  onStatusChange,
}: {
  row: Row<Application>;
  onStatusChange: (id: string, status: "pending" | "approved" | "rejected") => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.original.id as UniqueIdentifier,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  const application = row.original;



  const getAIValidityBadge = (isValid: boolean) => {
    return isValid ? (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        <IconRobot className="w-3 h-3 mr-1" />Valid
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
        <IconRobot className="w-3 h-3 mr-1" />Invalid
      </Badge>
    );
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "opacity-50" : ""}`}
      data-state={row.getIsSelected() && "selected"}
    >
      <TableCell>
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            {...attributes}
            {...listeners}
          >
            <IconGripVertical className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={application.photo || ""} />
            <AvatarFallback>
              {application.firstName?.[0]}{application.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {application.firstName} {application.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              {application.email}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {new Date(application.submittedAt).toLocaleDateString()}
        </div>
      </TableCell>
      <TableCell>
        <Select
          value={application.status}
          onValueChange={(value: "pending" | "approved" | "rejected") =>
            onStatusChange(application.id, value)
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">
              <div className="flex items-center">
                <IconClock className="w-4 h-4 mr-2 text-yellow-600" />
                Pending
              </div>
            </SelectItem>
            <SelectItem value="approved">
              <div className="flex items-center">
                <IconCheck className="w-4 h-4 mr-2 text-green-600" />
                Approved
              </div>
            </SelectItem>
            <SelectItem value="rejected">
              <div className="flex items-center">
                <IconX className="w-4 h-4 mr-2 text-red-600" />
                Rejected
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select defaultValue={application.reviewedBy || ""}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Assign reviewer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="John Smith">John Smith</SelectItem>
            <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
            <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
            <SelectItem value="Lisa Brown">Lisa Brown</SelectItem>
            <SelectItem value="Tom Davis">Tom Davis</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        {getAIValidityBadge(application.aiAnalysis.isValid)}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="sm">
                <IconEye className="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh] flex flex-col">
              <DrawerHeader className="shrink-0">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={application.photo || ""} />
                    <AvatarFallback>
                      {application.firstName?.[0]}{application.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <DrawerTitle className="truncate">
                      {application.firstName} {application.lastName}
                    </DrawerTitle>
                    <DrawerDescription className="truncate">
                      {application.currentTitle} at {application.currentCompany}
                    </DrawerDescription>
                  </div>
                </div>
              </DrawerHeader>
              
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">
                      <IconUser className="w-4 h-4 mr-2" />
                      Basic Details
                    </TabsTrigger>
                    <TabsTrigger value="resume">
                      <IconEye className="w-4 h-4 mr-2" />
                      Resume View
                    </TabsTrigger>
                    <TabsTrigger value="text">
                      <IconFileText className="w-4 h-4 mr-2" />
                      Resume Text
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="min-w-0">
                        <Label className="text-sm font-medium">Contact Information</Label>
                        <div className="mt-2 space-y-2">
                          <div className="text-sm wrap-break-word"><span className="text-muted-foreground">Email:</span> {application.email}</div>
                          <div className="text-sm wrap-break-word"><span className="text-muted-foreground">Phone:</span> {application.phone || "Not provided"}</div>
                          <div className="text-sm wrap-break-word"><span className="text-muted-foreground">Address:</span> {application.address || "Not provided"}</div>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <Label className="text-sm font-medium">Professional Info</Label>
                        <div className="mt-2 space-y-2">
                          <div className="text-sm wrap-break-word"><span className="text-muted-foreground">Current Title:</span> {application.currentTitle || "Not provided"}</div>
                          <div className="text-sm wrap-break-word"><span className="text-muted-foreground">Company:</span> {application.currentCompany || "Not provided"}</div>
                          <div className="text-sm wrap-break-word">
                            <span className="text-muted-foreground">Experience:</span>{" "}
                            {application.yearsOfExperience 
                              ? `${application.yearsOfExperience} years` 
                              : application.parsedData?.experience && application.parsedData.experience.length > 0
                                ? `${application.parsedData.experience.length} position${application.parsedData.experience.length !== 1 ? 's' : ''}`
                                : "Not specified"}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-2 min-w-0">
                        <Label className="text-sm font-medium">Skills</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {application.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="wrap-break-word max-w-full text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-2 min-w-0">
                        <Label className="text-sm font-medium">Cover Letter</Label>
                        <div className="mt-2 p-4 bg-muted/50 rounded-lg max-w-full overflow-hidden">
                          <p className="text-sm whitespace-pre-wrap wrap-break-word">{application.coverLetter || "No cover letter provided"}</p>
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-2 min-w-0">
                        <Label className="text-sm font-medium">AI Analysis</Label>
                        <div className="mt-2 p-4 bg-muted/50 rounded-lg max-w-full overflow-hidden">
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            {getAIValidityBadge(application.aiAnalysis.isValid)}
                          </div>
                          <p className="text-sm whitespace-pre-wrap wrap-break-word">{application.aiAnalysis.summary}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="resume" className="mt-6">
                    <div className="text-center py-8">
                      {(application.resume || application.resumeUrl) ? (
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg bg-muted/50">
                            <IconFileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="font-medium">
                              {application.resume?.originalName || application.resumeFilename || "Resume"}
                            </h3>
                            {application.resume?.size && (
                              <p className="text-sm text-muted-foreground">
                                {(application.resume.size / 1024 / 1024).toFixed(2)} MB • {application.resume.mimeType}
                              </p>
                            )}
                          </div>
                          <div className="flex justify-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const url = application.resume?.url || application.resumeUrl;
                                if (url) window.open(url, '_blank');
                              }}
                            >
                              <IconEye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const url = application.resume?.url || application.resumeUrl;
                                const filename = application.resume?.originalName || application.resumeFilename || 'resume.pdf';
                                if (url) {
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = filename;
                                  link.target = '_blank';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }
                              }}
                            >
                              <IconDownload className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                          {/* PDF Preview */}
                          {(application.resume?.url || application.resumeUrl) && (
                            <div className="mt-4 border rounded-lg overflow-hidden">
                              <iframe
                                src={`${application.resume?.url || application.resumeUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                className="w-full h-[600px]"
                                title="Resume Preview"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          <IconFileText className="w-12 h-12 mx-auto mb-4" />
                          <p>No resume uploaded</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="text" className="mt-6">
                    <div className="max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap wrap-break-word p-4 bg-muted/50 rounded-lg max-w-full overflow-x-hidden">
                        {application.resumeText || "No resume text available"}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <DrawerFooter className="shrink-0">
                <div className="flex justify-center space-x-3">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onStatusChange(application.id, "approved")}
                  >
                    <IconCheck className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => onStatusChange(application.id, "pending")}
                  >
                    <IconClock className="w-4 h-4 mr-2" />
                    Pending
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => onStatusChange(application.id, "rejected")}
                  >
                    <IconX className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </TableCell>
    </TableRow>
  );
}

function DataTablePagination({
  table,
  onBulkDelete,
}: {
  table: ReturnType<typeof useReactTable<Application>>;
  onBulkDelete: () => void;
}) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {selectedCount} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        {selectedCount > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            className="h-8"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Delete Selected ({selectedCount})
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
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
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ApplicationsDataTable({ data }: ApplicationsDataTableProps) {
  const [applications, setApplications] = React.useState<Application[]>(data);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});


  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  const handleStatusChange = (id: string, status: "pending" | "approved" | "rejected") => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? { ...app, status, lastUpdated: new Date().toISOString() }
          : app
      )
    );
    toast.success(`Application ${status} successfully`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application? This will remove the application and all associated files from the system.")) {
      return;
    }

    try {
      const response = await authenticatedFetch(`http://localhost:5001/api/applications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete application');
      }

      // Remove from local state
      setApplications((prev) => prev.filter((app) => app.id !== id));
      toast.success('Application deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete application';
      toast.error(message);
    }
  };

  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map(row => row.original.id);
    
    if (selectedIds.length === 0) {
      toast.error("No applications selected");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} application(s)? This will remove all applications and their associated files from the system.`)) {
      return;
    }

    try {
      const response = await authenticatedFetch('http://localhost:5001/api/applications/bulk/delete', {
        method: 'POST',
        body: JSON.stringify({ applicationIds: selectedIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete applications');
      }

      const result = await response.json();
      
      // Remove deleted applications from local state
      setApplications((prev) => prev.filter((app) => !selectedIds.includes(app.id)));
      
      // Clear selection
      table.resetRowSelection();

      toast.success(result.message || `Successfully deleted ${selectedIds.length} application(s)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete applications';
      toast.error(message);
    }
  };

  const columns: ColumnDef<Application>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "Application ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {row.getValue("id")}
        </div>
      ),
    },
    {
      id: "applicant",
      header: "Name",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      cell: ({ row }) => {
        const application = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={application.photo || ""} />
              <AvatarFallback>
                {application.firstName?.[0]}{application.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {application.firstName} {application.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                {application.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "submittedAt",
      header: "Date Applied",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue("submittedAt")).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        switch (status) {
          case "pending":
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><IconClock className="w-3 h-3 mr-1" />Pending</Badge>;
          case "approved":
            return <Badge variant="secondary" className="bg-green-100 text-green-800"><IconCheck className="w-3 h-3 mr-1" />Approved</Badge>;
          case "rejected":
            return <Badge variant="secondary" className="bg-red-100 text-red-800"><IconX className="w-3 h-3 mr-1" />Rejected</Badge>;
          default:
            return <Badge variant="secondary">{status}</Badge>;
        }
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "reviewedBy",
      header: "Reviewer",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.getValue("reviewedBy") || "Unassigned"}
        </div>
      ),
    },
    {
      id: "aiStatus",
      header: "AI Status",
      cell: ({ row }) => {
        const application = row.original;
        return application.aiAnalysis.isValid ? (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <IconRobot className="w-3 h-3 mr-1" />Valid
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <IconRobot className="w-3 h-3 mr-1" />Invalid
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const application = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange(application.id, "approved")}>
                <IconCheck className="mr-2 h-4 w-4" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(application.id, "pending")}>
                <IconClock className="mr-2 h-4 w-4" />
                Set Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(application.id, "rejected")}>
                <IconX className="mr-2 h-4 w-4" />
                Reject
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(application.id)}
                className="text-destructive focus:text-destructive"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: applications,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setApplications((data) => {
        const oldIndex = data.findIndex((item) => item.id === active.id);
        const newIndex = data.findIndex((item) => item.id === over?.id);

        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4 px-4 lg:px-6">
        <Input
          placeholder="Search applications..."
          value={(table.getColumn("applicant")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("applicant")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
                <IconLayoutColumns className="mr-2 h-4 w-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" && column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border mx-4 lg:mx-6">
        <Table>
          <TableHeader>
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={applications.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <SortableRow
                      key={row.id}
                      row={row}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No applications found.
                    </TableCell>
                  </TableRow>
                )}
              </SortableContext>
            </DndContext>
          </TableBody>
        </Table>
      </div>
      <div className="py-4 px-4 lg:px-6">
        <DataTablePagination table={table} onBulkDelete={handleBulkDelete} />
      </div>
    </div>
  );
}