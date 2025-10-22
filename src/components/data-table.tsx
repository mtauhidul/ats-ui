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
  IconPlayerPlay,
  IconVideo,
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
import { Separator } from "@/components/ui/separator";
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
    header: "AI Status",
    cell: ({ row }) => (
      <div className="w-24">
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
          {row.original.status === "Done" ? (
            <>
              <IconCircleCheckFilled className="size-3 fill-green-500 dark:fill-green-400" />
              Done
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

  // Helper function to get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
        return 'default';
      case 'in progress':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Helper function to get AI status badge
  const getAIStatusBadge = (type: string) => {
    const isValid = type === 'valid';
    return (
      <Badge variant={isValid ? 'default' : 'destructive'} className="text-xs">
        {isValid ? 'Valid' : 'Invalid'}
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
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Application Details</DrawerTitle>
          <DrawerDescription>
            View applicant information and application status
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-6 overflow-y-auto px-4 text-sm">
          {/* Applicant Photo and Basic Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={item.photo || ""} />
              <AvatarFallback className="text-lg">
                {item.header.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{item.header}</h3>
              <p className="text-muted-foreground">{item.email}</p>
              {item.phone && <p className="text-muted-foreground text-xs">{item.phone}</p>}
            </div>
          </div>

          <Separator />

          {/* Application Details Grid */}
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Current Status</Label>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">AI Status</Label>
                <div className="mt-1">
                  {getAIStatusBadge(item.type)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Date Applied</Label>
                <p className="mt-1 text-sm">{item.dateApplied || 'Not available'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Job ID</Label>
                <p className="mt-1 text-sm font-mono">{item.jobIdDisplay || 'Not assigned'}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Assigned Reviewer</Label>
              <div className="mt-1">
                <span className="text-sm font-medium text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/20 px-2 py-1 rounded-md">
                  {item.reviewer}
                </span>
              </div>
            </div>

            {/* Additional Details */}
            {(item.currentTitle || item.currentCompany || item.yearsOfExperience) && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Professional Information</Label>
                  <div className="mt-2 space-y-1">
                    {item.currentTitle && (
                      <p className="text-sm"><span className="font-medium">Title:</span> {item.currentTitle}</p>
                    )}
                    {item.currentCompany && (
                      <p className="text-sm"><span className="font-medium">Company:</span> {item.currentCompany}</p>
                    )}
                    {item.yearsOfExperience && (
                      <p className="text-sm"><span className="font-medium">Experience:</span> {item.yearsOfExperience} years</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Skills */}
            {item.skills && item.skills.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Skills</Label>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.skills.slice(0, 6).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {item.skills.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.skills.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Resume Information */}
            {(item.resumeFilename || item.resumeText) && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Resume</Label>
                  <div className="mt-2 space-y-2">
                    {item.resumeFilename && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconFileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{item.resumeFilename}</span>
                          {item.resumeFileSize && (
                            <span className="text-xs text-muted-foreground">({item.resumeFileSize})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Handle resume download
                              if (item.resumeFilename) {
                                console.log(`Downloading resume: ${item.resumeFilename}`);
                                // Add your download logic here
                                const link = document.createElement('a');
                                link.href = `/uploads/resumes/${item.resumeFilename}`;
                                link.download = item.resumeFilename;
                                link.click();
                              }
                            }}
                            className="h-8 px-2 hover:bg-green-50 hover:text-green-600"
                            title="Download Resume"
                          >
                            <IconDownload className="h-4 w-4" />
                            <span className="sr-only">Download Resume</span>
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Resume Preview Section */}
                    {item.resumeFilename && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-muted-foreground">Resume Preview:</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowResumePreview(!showResumePreview)}
                            className="h-6 px-2 text-xs"
                          >
                            {showResumePreview ? 'Hide Preview' : 'Show Preview'}
                          </Button>
                        </div>
                        {showResumePreview && (
                          <div className="border rounded-lg overflow-hidden bg-white">
                            {item.resumeFilename.toLowerCase().endsWith('.pdf') ? (
                              <div className="relative">
                                <iframe
                                  src={`/uploads/resumes/${item.resumeFilename}#toolbar=0&navpanes=0&scrollbar=0`}
                                  className="w-full h-96 border-0"
                                  title="Resume Preview"
                                  onError={() => {
                                    // Fallback if iframe fails to load
                                    console.log('PDF preview failed, consider showing text version');
                                  }}
                                />
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                  PDF Preview
                                </div>
                              </div>
                            ) : item.resumeText ? (
                              <div className="max-h-96 overflow-y-auto p-4 bg-gray-50">
                                <div className="mb-2 text-xs text-muted-foreground font-medium">Text Version:</div>
                                <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                                  {item.resumeText}
                                </pre>
                              </div>
                            ) : (
                              <div className="p-4 text-center text-muted-foreground">
                                <IconFileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Preview not available for this file type</p>
                                <p className="text-xs">Please use the download button to view the resume</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {item.coverLetter && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Cover Letter:</p>
                        <div className="p-3 bg-muted/30 rounded-lg border max-h-80 overflow-y-auto">
                          <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed break-words">
                            {item.coverLetter}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Video Introduction Section */}
                    {item.videoIntroUrl && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <IconVideo className="h-4 w-4 text-muted-foreground" />
                            <p className="text-xs font-medium text-muted-foreground">Video Introduction:</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {item.videoIntroDuration && (
                              <span>{item.videoIntroDuration}</span>
                            )}
                            {item.videoIntroFileSize && (
                              <span>({item.videoIntroFileSize})</span>
                            )}
                          </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden bg-black">
                          <video
                            controls
                            className="w-full max-h-80"
                            preload="metadata"
                            poster={item.photo || undefined}
                          >
                            <source src={item.videoIntroUrl} type="video/mp4" />
                            <source src={item.videoIntroUrl} type="video/webm" />
                            <source src={item.videoIntroUrl} type="video/ogg" />
                            <div className="p-4 text-center text-white">
                              <IconPlayerPlay className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Your browser does not support video playback</p>
                              <p className="text-xs">Please download the video to view it</p>
                            </div>
                          </video>
                        </div>
                        {item.videoIntroFilename && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span>File: {item.videoIntroFilename}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Personal Details Section */}
          <Separator />
          <div>
            <Label className="text-base font-semibold text-foreground">Personal Details</Label>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="mt-1 text-sm">{item.header}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                  <p className="mt-1 text-sm break-all">{item.email || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                  <p className="mt-1 text-sm">{item.phone || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p className="mt-1 text-sm">{item.location || 'Not specified'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">LinkedIn Profile</Label>
                  {item.linkedinUrl ? (
                    <a href={item.linkedinUrl} target="_blank" rel="noopener noreferrer" 
                       className="mt-1 text-sm text-blue-600 hover:text-blue-800 break-all">
                      {item.linkedinUrl}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">Not provided</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Portfolio/Website</Label>
                  {item.portfolioUrl ? (
                    <a href={item.portfolioUrl} target="_blank" rel="noopener noreferrer" 
                       className="mt-1 text-sm text-blue-600 hover:text-blue-800 break-all">
                      {item.portfolioUrl}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">Not provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Background */}
          <div>
            <Label className="text-base font-semibold text-foreground">Professional Background</Label>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Current Position</Label>
                  <p className="mt-1 text-sm">{item.currentTitle || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Current Company</Label>
                  <p className="mt-1 text-sm">{item.currentCompany || 'Not specified'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Years of Experience</Label>
                  <p className="mt-1 text-sm">{item.yearsOfExperience ? `${item.yearsOfExperience} years` : 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Education Level</Label>
                  <p className="mt-1 text-sm">{item.educationLevel || 'Not specified'}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Salary Expectation</Label>
                <p className="mt-1 text-sm">{item.expectedSalary || 'Not specified'}</p>
              </div>

              {/* Technical Skills */}
              {item.skills && item.skills.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Technical Skills</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {item.languages && item.languages.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Languages</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.languages.map((language, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Application Notes */}
          {item.notes && (
            <div>
              <Label className="text-base font-semibold text-foreground">Application Notes</Label>
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{item.notes}</p>
              </div>
            </div>
          )}

          {/* Resume Full Text */}
          {item.resumeText && (
            <div>
              <Label className="text-base font-semibold text-foreground">Resume Full Text</Label>
              <div className="mt-2 p-4 bg-muted/50 border rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                  {item.resumeText}
                </pre>
              </div>
            </div>
          )}
        </div>
        <DrawerFooter>
          <Button 
            onClick={() => {
              // Handle approve functionality
              console.log(`Approving application for ${item.header}`);
              // Add your approve logic here
            }}
            className="flex items-center gap-2"
          >
            <IconCheck className="h-4 w-4" />
            Approve
          </Button>
          <DrawerClose asChild>
            <Button 
              variant="outline"
              onClick={() => {
                // Handle reject functionality
                console.log(`Rejecting application for ${item.header}`);
                // Add your reject logic here
              }}
              className="flex items-center gap-2"
            >
              <IconX className="h-4 w-4" />
              Reject
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
