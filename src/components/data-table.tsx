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
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconFileText,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconCheck,
  IconX,
  IconDownload,
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
  type Row,
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
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { TabsTrigger } from "@radix-ui/react-tabs";
import type { schema } from "./data-table-schema";

// Create a separate component for the drag handle
// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
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
    accessorKey: "header",
    header: "Applicant Name",
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
    header: "AI Recommendation",
    cell: ({ row }) => (
      <div className="w-28">
        <Badge
          variant="outline"
          className="text-muted-foreground px-2 py-1 flex items-center gap-1 text-xs"
        >
          {row.original.type === "valid" ? (
            <>
              <IconCircleCheckFilled className="size-3 fill-green-500 dark:fill-green-400" />
              Valid
            </>
          ) : (
            <>
              <span className="size-3 text-red-500">✕</span>
              Invalid
            </>
          )}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge
          variant="outline"
          className="text-muted-foreground px-2 py-1 flex items-center gap-1"
        >
          {row.original.status === "Approved" ? (
            <>
              <IconCircleCheckFilled className="size-3 fill-green-500 dark:fill-green-400" />
              Approved
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
  },
  {
    accessorKey: "target",
    header: () => <div className="w-full text-left">Date Applied</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left text-sm w-32">
          {row.original.dateApplied || new Date().toLocaleDateString()}
        </div>
      );
    },
  },
  {
    accessorKey: "limit",
    header: () => <div className="w-full text-left">Job ID</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left text-sm w-24">
          {row.original.jobIdDisplay || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "reviewer",
    header: "Reviewer",
    cell: ({ row }) => {
      const isAssigned =
        row.original.reviewer !== "Unassigned" &&
        row.original.reviewer !== "Assign reviewer";

      return (
        <div className="w-40">
          <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
            Reviewer
          </Label>
          <Select
            defaultValue={isAssigned ? row.original.reviewer : undefined}
            onValueChange={(value) => {
              // Update the reviewer in the data
              console.log(
                `Assigning reviewer ${value} to application ${row.original.id}`
              );
              // In a real app, this would update the backend/state
            }}
          >
            <SelectTrigger
              className="w-full **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              id={`${row.original.id}-reviewer`}
            >
              <SelectValue placeholder="Assign Reviewer" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="Assign Reviewer" disabled>
                Assign Reviewer
              </SelectItem>
              <SelectItem value="John Smith">John Smith</SelectItem>
              <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
              <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
              <SelectItem value="Lisa Brown">Lisa Brown</SelectItem>
              <SelectItem value="Tom Davis">Tom Davis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: () => (
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
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({
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
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="past-performance">Past Performance</SelectItem>
            <SelectItem value="key-personnel">Key Personnel</SelectItem>
            <SelectItem value="focus-documents">Focus Documents</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="past-performance">
            Past Performance <Badge variant="secondary">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel">
            Key Personnel <Badge variant="secondary">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Add Section</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
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
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
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
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}



function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();
  const [showResumePreview, setShowResumePreview] = React.useState(false);

  // Auto-hide resume preview when drawer closes
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  
  React.useEffect(() => {
    if (!isDrawerOpen && showResumePreview) {
      setShowResumePreview(false);
    }
  }, [isDrawerOpen, showResumePreview]);

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'approved') {
      return (
        <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-500/20 hover:bg-green-500/20">
          <IconCircleCheckFilled className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    } else if (statusLower === 'rejected') {
      return (
        <Badge className="bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-500/20 hover:bg-red-500/20">
          <IconX className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20">
          <IconLoader className="h-3 w-3 mr-1 animate-spin" />
          In Process
        </Badge>
      );
    }
  };

  // Helper function to get AI status badge
  const getAIStatusBadge = (type: string) => {
    const isValid = type === 'valid';
    return isValid ? (
      <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-500/20 hover:bg-green-500/20">
        <IconCircleCheckFilled className="h-3 w-3 mr-1" />
        AI Approved
      </Badge>
    ) : (
      <Badge className="bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-500/20 hover:bg-red-500/20">
        <IconX className="h-3 w-3 mr-1" />
        AI Rejected
      </Badge>
    );
  };

  return (
    <Drawer 
      direction={isMobile ? "bottom" : "right"}
      onOpenChange={setIsDrawerOpen}
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
                {item.header.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold mb-1">{item.header}</h3>
              {item.email && (
                <p className="text-sm text-muted-foreground truncate mb-0.5">{item.email}</p>
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
              <Label className="text-xs text-muted-foreground">Date Applied</Label>
              <p className="text-sm font-medium mt-1">{item.dateApplied || 'N/A'}</p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <Label className="text-xs text-muted-foreground">Job ID</Label>
              <p className="text-sm font-medium font-mono mt-1">{item.jobIdDisplay || 'N/A'}</p>
            </div>
            <div className="rounded-lg border bg-lime-500/10 dark:bg-lime-500/10 border-lime-500/20 p-3">
              <Label className="text-xs text-lime-700 dark:text-lime-400 font-medium">Reviewer</Label>
              <p className="text-sm font-semibold text-lime-800 dark:text-lime-300 mt-1 truncate">{item.reviewer}</p>
            </div>
            {item.yearsOfExperience && (
              <div className="rounded-lg border bg-card p-3">
                <Label className="text-xs text-muted-foreground">Experience</Label>
                <p className="text-sm font-medium mt-1">{item.yearsOfExperience} years</p>
              </div>
            )}
          </div>

          {/* Professional Information */}
          {(item.currentTitle || item.currentCompany || item.educationLevel || item.expectedSalary) && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                Professional Information
              </h4>
              <div className="rounded-lg border divide-y">
                {item.currentTitle && (
                  <div className="flex items-center justify-between p-3 text-sm">
                    <span className="text-muted-foreground">Position</span>
                    <span className="font-medium text-right">{item.currentTitle}</span>
                  </div>
                )}
                {item.currentCompany && (
                  <div className="flex items-center justify-between p-3 text-sm">
                    <span className="text-muted-foreground">Company</span>
                    <span className="font-medium text-right">{item.currentCompany}</span>
                  </div>
                )}
                {item.educationLevel && (
                  <div className="flex items-center justify-between p-3 text-sm">
                    <span className="text-muted-foreground">Education</span>
                    <span className="font-medium text-right">{item.educationLevel}</span>
                  </div>
                )}
                {item.expectedSalary && (
                  <div className="flex items-center justify-between p-3 text-sm">
                    <span className="text-muted-foreground">Salary Expectation</span>
                    <span className="font-medium text-right">{item.expectedSalary}</span>
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
                    <span className="font-medium text-right">{item.location}</span>
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
          {((item.skills && item.skills.length > 0) || (item.languages && item.languages.length > 0)) && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Skills & Languages</h4>
              <div className="rounded-lg border bg-card p-4 space-y-3">
                {item.skills && item.skills.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Technical Skills</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {item.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs font-normal">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {item.languages && item.languages.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Languages</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {item.languages.map((language, index) => (
                        <Badge key={index} variant="outline" className="text-xs font-normal">
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
                          <p className="text-sm font-medium truncate">{item.resumeFilename}</p>
                          {item.resumeFileSize && (
                            <p className="text-xs text-muted-foreground">{item.resumeFileSize}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowResumePreview(!showResumePreview)}
                          className="h-8 px-3"
                        >
                          <span className="text-xs">{showResumePreview ? 'Hide' : 'View'}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            if (item.resumeFilename) {
                              const link = document.createElement('a');
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
                        {item.resumeFilename.toLowerCase().endsWith('.pdf') ? (
                          <div className="relative bg-muted/30">
                            <iframe
                              src={`/uploads/resumes/${item.resumeFilename}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                              className="w-full h-[500px]"
                              title="Resume Preview"
                              onError={(e) => {
                                console.error('PDF preview failed:', e);
                                (e.target as HTMLIFrameElement).style.display = 'none';
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
                            <p className="text-sm text-muted-foreground mb-1">Preview not available</p>
                            <p className="text-xs text-muted-foreground">Download the file to view</p>
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
                      <Label className="text-xs font-medium">Cover Letter</Label>
                    </div>
                    <div className="p-4 max-h-64 overflow-y-auto bg-card">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.coverLetter}</p>
                    </div>
                  </div>
                )}

                {/* Video Introduction */}
                {item.videoIntroUrl && (
                  <div className="rounded-lg border overflow-hidden">
                    <div className="px-4 py-2.5 bg-muted/50 border-b flex items-center justify-between">
                      <Label className="text-xs font-medium">Video Introduction</Label>
                      {(item.videoIntroDuration || item.videoIntroFileSize) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {item.videoIntroDuration && <span>{item.videoIntroDuration}</span>}
                          {item.videoIntroFileSize && <span>• {item.videoIntroFileSize}</span>}
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
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                console.log(`Approving application for ${item.header}`);
              }}
              className="flex-1"
              size="default"
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
              >
                <IconX className="h-4 w-4" />
                Reject
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
