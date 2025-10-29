import {
  IconArrowsSort,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconClockHour4,
  IconCopy,
  IconDotsVertical,
  IconDownload,
  IconFilter,
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
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { schema } from "./data-table-schema.tsx";
import { useTeam } from "@/store/hooks/index";
import { useCandidates } from "@/store/hooks/index";

// Table cell viewer component for candidate name - decorated like applications table
function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  return (
    <Link
      to={`/dashboard/candidates/${item.id}`}
      className="group flex flex-col transition-all duration-200 cursor-pointer relative py-1 px-2 -mx-2 rounded-md hover:bg-primary/5"
    >
      <span className="font-medium text-foreground group-hover:text-primary transition-all duration-200 flex items-center gap-1.5">
        {item.header}
        <IconChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transform -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
      </span>
      <span className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors duration-200">
        {item.email}
      </span>
    </Link>
  );
}

// Assigned team member selector component
function AssignedSelector({
  candidateId,
  initialAssignee,
  onUpdate,
}: {
  candidateId: string | number;
  initialAssignee?: string | null;
  onUpdate?: () => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<string | null>(
    initialAssignee || null
  );

  // Fetch real team members from Redux
  const { teamMembers, fetchTeam } = useTeam();
  const { updateCandidate } = useCandidates();

  // Fetch team members on mount
  React.useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // Update selected member when initialAssignee changes (e.g., after data refresh)
  React.useEffect(() => {
    setSelectedMember(initialAssignee || null);
  }, [initialAssignee]);

  const handleValueChange = async (value: string) => {
    if (value === "unassign") {
      // Handle unassign
      const previousAssignee = selectedMember;
      setSelectedMember(null);
      
      try {
        await updateCandidate(candidateId.toString(), { assignedTo: null });
        onUpdate?.(); // Trigger parent refresh
        toast.success("Team member unassigned");
      } catch (error) {
        console.error('Failed to unassign candidate:', error);
        toast.error('Failed to unassign team member');
        setSelectedMember(previousAssignee);
      }
    } else {
      // Find the team member by ID (value is the member ID)
      const member = teamMembers.find(m => m.id === value);
      if (member) {
        const memberName = `${member.firstName} ${member.lastName}`.trim() || member.email;
        setSelectedMember(memberName);
        
        try {
          // Use userId (the actual user's ID), not id (the team member document ID)
          const userIdToAssign = member.userId || member.id;
          await updateCandidate(candidateId.toString(), { assignedTo: userIdToAssign });
          onUpdate?.(); // Trigger parent refresh
          toast.success(`Assigned ${memberName} to candidate`);
        } catch (error) {
          console.error('Failed to assign candidate:', error);
          toast.error('Failed to assign team member');
          setSelectedMember(initialAssignee || null);
        }
      }
    }
  };

  // Get the current value for the Select component
  const currentValue = React.useMemo(() => {
    if (!selectedMember) return "unassigned";
    // Find member ID by name
    const member = teamMembers.find(m => {
      const name = `${m.firstName} ${m.lastName}`.trim() || m.email;
      return name === selectedMember;
    });
    return member?.id || "unassigned";
  }, [selectedMember, teamMembers]);

  return (
    <Select
      open={isOpen}
      onOpenChange={setIsOpen}
      value={currentValue}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="h-8 text-sm w-full">
        <SelectValue>{selectedMember || "Assign someone"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="p-1">
          <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
            Select Team Member
          </div>
          {teamMembers.map((member) => {
            const memberName = `${member.firstName} ${member.lastName}`.trim() || member.email;
            return (
              <SelectItem
                key={member.id}
                value={member.id}
                className="text-sm"
              >
                {memberName}
              </SelectItem>
            );
          })}
          {selectedMember && (
            <>
              <div className="border-t my-1" />
              <SelectItem
                value="unassign"
                className="text-sm text-destructive hover:text-destructive"
              >
                <div className="flex items-center">
                  <IconX className="h-3 w-3 mr-2" />
                  Unassign
                </div>
              </SelectItem>
            </>
          )}
        </div>
      </SelectContent>
    </Select>
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
    size: 50,
    minSize: 50,
    maxSize: 50,
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
        <div className="min-w-[180px] max-w-[180px]">
          <TableCellViewer item={row.original} />
        </div>
      );
    },
    enableHiding: false,
    size: 180,
    minSize: 180,
    maxSize: 180,
  },
  {
    accessorKey: "jobIdDisplay",
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
    cell: ({ row }) => {
      const jobId = row.original.jobIdDisplay || "N/A";
      const handleCopy = async () => {
        if (jobId === "N/A") return;
        try {
          await navigator.clipboard.writeText(jobId);
          toast.success("Job ID copied to clipboard!");
        } catch {
          toast.error("Failed to copy Job ID");
        }
      };

      return (
        <div className="min-w-[200px] max-w-[200px]">
          <div className="group flex items-center">
            <span className="text-xs font-mono font-semibold text-foreground bg-muted pr-2 py-1 rounded">
              {jobId}
            </span>
            {jobId !== "N/A" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={handleCopy}
              >
                <IconCopy className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableHiding: true,
    size: 200,
    minSize: 200,
    maxSize: 200,
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
      <div className="min-w-[110px] max-w-[110px]">
        <Badge
          variant="outline"
          className="text-muted-foreground px-2.5 py-1 flex items-center gap-1 w-fit whitespace-nowrap text-xs"
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
      // Support both single value and array of values
      if (Array.isArray(value)) {
        return value.includes(row.getValue(id));
      }
      return row.getValue(id) === value;
    },
    enableHiding: true,
    size: 110,
    minSize: 110,
    maxSize: 110,
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
      // currentStage can be either a string or an object { id, name, color, order }
      const currentStage = row.original.currentStage as string | { name?: string } | undefined;
      const stageName = typeof currentStage === 'string' 
        ? currentStage 
        : currentStage?.name || "Not Started";

      // Define stage colors
      const getStageColor = (stage: string) => {
        switch (stage.toLowerCase()) {
          case "new applications":
          case "new application":
            return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800";
          case "resume screening":
          case "screening":
            return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 border-purple-200 dark:border-purple-800";
          case "technical interview":
          case "behavioral interview":
          case "interview":
            return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800";
          case "technical test":
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
        <div className="min-w-[120px] max-w-[120px]">
          <Badge
            className={`px-2.5 py-1 text-xs font-medium w-fit ${getStageColor(
              stageName
            )}`}
          >
            {stageName}
          </Badge>
        </div>
      );
    },
    filterFn: (row, _id, value) => {
      return value.includes(row.original.dateApplied);
    },
    enableHiding: true,
    size: 120,
    minSize: 120,
    maxSize: 120,
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
      const clientName = row.original.clientName || "-";
      const clientLogo = row.original.clientLogo;

      return (
        <div className="min-w-[150px] max-w-[150px] flex items-center gap-1">
          {clientLogo && (
            <Avatar className="size-6 rounded flex-shrink-0">
              <AvatarImage src={clientLogo} alt={clientName} />
              <AvatarFallback className="text-xs rounded">
                {clientName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="text-xs truncate">{clientName}</span>
        </div>
      );
    },
    enableHiding: true,
    size: 150,
    minSize: 150,
    maxSize: 150,
  },
  {
    accessorKey: "reviewer",
    header: "Assigned",
    cell: ({ row }) => {
      // Get assignedTo - can be a string (ID) or populated object
      const assignedTo = row.original.assignedTo as string | { id?: string; _id?: string; firstName?: string; lastName?: string; email?: string } | null | undefined;
      let assignedName: string | null = null;
      
      if (assignedTo) {
        if (typeof assignedTo === 'object') {
          // Populated user object
          assignedName = `${assignedTo.firstName || ''} ${assignedTo.lastName || ''}`.trim() || assignedTo.email || null;
        }
      }
      
      return (
        <div className="min-w-[160px] max-w-[160px]">
          <AssignedSelector
            candidateId={row.original.id}
            initialAssignee={assignedName}
            onUpdate={() => {
              // Trigger a refetch of candidates when assignment changes
              // This will be handled by the parent component
              window.dispatchEvent(new CustomEvent('refetchCandidates'));
            }}
          />
        </div>
      );
    },
    enableHiding: true,
    size: 160,
    minSize: 160,
    maxSize: 160,
  },
  {
    id: "actions",
    cell: () => null,
    enableHiding: false,
    size: 60,
    minSize: 60,
    maxSize: 60,
  },
];

// Row actions column
const createActionsColumn = (handlers: {
  onHire: (id: string | number) => void;
  onReject: (id: string | number) => void;
  onAssignTeam: (id: string | number) => void;
  onDownloadResume: (id: string | number) => void;
  onDelete: (id: string | number) => void;
}): ColumnDef<z.infer<typeof schema>> => ({
  id: "actions",
  cell: ({ row }) => (
    <div className="min-w-[60px] max-w-[60px] flex justify-start">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-foreground hover:text-foreground hover:bg-muted/50 flex size-8 px-0"
            size="icon"
          >
            <IconDotsVertical className="h-5 w-5" />
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
    </div>
  ),
  size: 60,
  minSize: 60,
  maxSize: 60,
});

export function CandidatesDataTable({
  data: initialData,
  onDeleteCandidate,
}: {
  data: z.infer<typeof schema>[];
  onDeleteCandidate?: (candidateId: string) => void;
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

  // Sync local data state with prop changes (important for when candidates are loaded/updated)
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Bulk action handlers
  const handleBulkHire = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((r) => r.original.id);
    setData((prevData) =>
      prevData.map((item) =>
        selectedIds.includes(item.id) ? { ...item, status: "Hired" } : item
      )
    );
    table.resetRowSelection();
  };

  const handleBulkReject = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((r) => r.original.id);
    setData((prevData) =>
      prevData.map((item) =>
        selectedIds.includes(item.id) ? { ...item, status: "Rejected" } : item
      )
    );
    table.resetRowSelection();
  };

  const handleBulkAssignTeam = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((r) => r.original.id);
    const teamMember = prompt("Enter team member name:");
    if (teamMember) {
      setData((prevData) =>
        prevData.map((item) =>
          selectedIds.includes(item.id)
            ? { ...item, reviewer: teamMember }
            : item
        )
      );
      table.resetRowSelection();
    }
  };

  const handleBulkExport = () => {
    const selectedData = table
      .getFilteredSelectedRowModel()
      .rows.map((r) => r.original);
    console.log("Exporting data:", selectedData);
    alert(`Exporting ${selectedData.length} candidates`);
  };

  // Individual action handlers
  const handleHire = (id: string | number) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, status: "Hired" } : item
      )
    );
  };

  const handleReject = (id: string | number) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, status: "Rejected" } : item
      )
    );
  };

  const handleAssignTeam = (id: string | number) => {
    const teamMember = prompt("Enter team member name:");
    if (teamMember) {
      setData((prevData) =>
        prevData.map((item) =>
          item.id === id ? { ...item, reviewer: teamMember } : item
        )
      );
    }
  };

  const handleDownloadResume = (id: string | number) => {
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

  const handleDelete = (id: string | number) => {
    if (confirm("Are you sure you want to delete this candidate?")) {
      // Find the actual candidate ID from the data
      const candidate = data.find((item) => item.id === id);
      if (candidate && candidate.candidateId && onDeleteCandidate) {
        onDeleteCandidate(candidate.candidateId);
      } else {
        // Fallback to local state update if no callback provided
        setData((prevData) => prevData.filter((item) => item.id !== id));
      }
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
        row.original.header, // Candidate name
        row.original.email,
        row.original.phone,
        row.original.status,
        row.original.reviewer,
        row.original.jobIdDisplay, // Job ID
        row.original.jobTitle, // Job title
        row.original.clientName, // Client name
        row.original.currentTitle,
        row.original.currentCompany,
        row.original.currentStage, // Pipeline stage
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
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {columnFilters.length}
                    </Badge>
                  )}
                  <IconChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5 text-xs font-semibold">
                  Filter by Status
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={!columnFilters.find((f) => f.id === "status")}
                  onCheckedChange={() => {
                    setColumnFilters((prev) =>
                      prev.filter((f) => f.id !== "status")
                    );
                  }}
                >
                  All Statuses
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={
                    columnFilters.find((f) => f.id === "status")?.value ===
                    "Hired"
                  }
                  onCheckedChange={(checked) => {
                    setColumnFilters((prev) =>
                      checked
                        ? [
                            ...prev.filter((f) => f.id !== "status"),
                            { id: "status", value: "Hired" },
                          ]
                        : prev.filter((f) => f.id !== "status")
                    );
                  }}
                >
                  <IconUserCheck className="h-3 w-3 mr-2 text-green-600" />
                  Hired
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={
                    columnFilters.find((f) => f.id === "status")?.value ===
                    "In Process"
                  }
                  onCheckedChange={(checked) => {
                    setColumnFilters((prev) =>
                      checked
                        ? [
                            ...prev.filter((f) => f.id !== "status"),
                            { id: "status", value: "In Process" },
                          ]
                        : prev.filter((f) => f.id !== "status")
                    );
                  }}
                >
                  <IconClockHour4 className="h-3 w-3 mr-2 text-amber-600" />
                  In Process
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={
                    columnFilters.find((f) => f.id === "status")?.value ===
                    "Rejected"
                  }
                  onCheckedChange={(checked) => {
                    setColumnFilters((prev) =>
                      checked
                        ? [
                            ...prev.filter((f) => f.id !== "status"),
                            { id: "status", value: "Rejected" },
                          ]
                        : prev.filter((f) => f.id !== "status")
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
                <DropdownMenuItem
                  onClick={() =>
                    setSorting([{ id: "candidateName", desc: false }])
                  }
                >
                  Name (A → Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setSorting([{ id: "candidateName", desc: true }])
                  }
                >
                  Name (Z → A)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSorting([{ id: "target", desc: true }])}
                >
                  Date Applied (Newest)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSorting([{ id: "target", desc: false }])}
                >
                  Date Applied (Oldest)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSorting([{ id: "status", desc: false }])}
                >
                  Status (A → Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSorting([{ id: "jobIdDisplay", desc: false }])}
                >
                  Job ID (A → Z)
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
                <div className="px-2 py-1.5 text-xs font-semibold">
                  Toggle Columns
                </div>
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
                  checked={table.getColumn("jobIdDisplay")?.getIsVisible()}
                  onCheckedChange={(value) =>
                    table.getColumn("jobIdDisplay")?.toggleVisibility(!!value)
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
                  Assigned
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <TabsContent value="outline" className="m-0 border-0">
        <div className="rounded-lg border overflow-x-auto mx-4 lg:mx-6">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: header.getSize() }}
                      >
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
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                      >
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
