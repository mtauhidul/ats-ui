import { AddTagModal } from "@/components/modals/add-tag-modal";
import { EditTagModal } from "@/components/modals/edit-tag-modal";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector, useTags } from "@/store/hooks/index";
import { selectTags } from "@/store/selectors";
import type { CreateTagRequest, Tag, UpdateTagRequest } from "@/types/tag";
import {
  AlertCircle,
  Edit2,
  Plus,
  Search,
  Tag as TagIcon,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TagsPage() {
  const { fetchTags, createTag, updateTag, deleteTag } = useTags();
  const tags = useAppSelector(selectTags);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleAddTag = (data: CreateTagRequest) => {
    createTag(data);
  };

  const handleUpdateTag = (data: UpdateTagRequest) => {
    if (!editingTag) return;
    updateTag(editingTag.id, data);
    setEditingTag(null);
  };

  const handleDeleteTag = (tagId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tag = tags.find((t: any) => t.id === tagId);

    if (tag?.isSystem) {
      toast.error("System tags cannot be deleted");
      return;
    }

    setTagToDelete({ id: tagId, name: tag.name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (tagToDelete) {
      deleteTag(tagToDelete.id);
    }
  };

  // Filter and sort tags
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredTags = (tags as any[])
    .filter((tag) => {
      // Search filter
      const matchesSearch =
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "system" && tag.isSystem) ||
        (typeFilter === "custom" && !tag.isSystem);

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

  const systemTags = tags.filter((t: Tag) => t.isSystem);
  const customTags = tags.filter((t: Tag) => !t.isSystem);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-3 py-3 md:gap-4 md:py-4">
          <div className="px-3 lg:px-4">
            {/* Header */}
            <div className="mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 md:mb-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1 md:mb-2">
                    Tags
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Manage tags for jobs and candidates
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full sm:w-auto shrink-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mt-4 md:mt-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tags by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 md:pl-10 h-8 md:h-9 text-xs md:text-sm"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-40 md:w-[180px] h-8 md:h-9 text-xs md:text-sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="system">System Tags</SelectItem>
                    <SelectItem value="custom">Custom Tags</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40 md:w-[180px] h-8 md:h-9 text-xs md:text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 mt-4 md:mt-6">
                <div className="rounded-lg border bg-card p-2 md:p-3 shadow-sm">
                  <div className="flex items-start justify-between mb-1 md:mb-2">
                    <div className="rounded-md bg-primary/10 p-1.5 md:p-2">
                      <TagIcon className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-xl md:text-2xl font-bold mb-0.5">
                    {tags.length}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Total Tags
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-2 md:p-3 shadow-sm">
                  <div className="flex items-start justify-between mb-1 md:mb-2">
                    <div className="rounded-md bg-blue-500/10 p-1.5 md:p-2">
                      <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-blue-600 dark:text-blue-500" />
                    </div>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-500 mb-0.5">
                    {systemTags.length}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    System Tags
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-2 md:p-3 shadow-sm">
                  <div className="flex items-start justify-between mb-1 md:mb-2">
                    <div className="rounded-md bg-green-500/10 p-1.5 md:p-2">
                      <TagIcon className="h-3 w-3 md:h-4 md:w-4 text-green-600 dark:text-green-500" />
                    </div>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-500 mb-0.5">
                    {customTags.length}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Custom Tags
                  </p>
                </div>
              </div>
            </div>

            {/* Tags Table */}
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Tag
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTags.map((tag) => (
                      <tr
                        key={tag.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <span
                            className="inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-xs md:text-sm font-medium"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                              border: `1px solid ${tag.color}40`,
                            }}
                          >
                            {tag.name}
                          </span>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-muted-foreground">
                          {tag.description || "—"}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          {tag.isSystem && (
                            <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-500 border border-blue-500/20">
                              System
                            </span>
                          )}
                          {!tag.isSystem && (
                            <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded bg-muted text-muted-foreground border">
                              Custom
                            </span>
                          )}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 md:h-8 md:w-8"
                              onClick={() => setEditingTag(tag)}
                            >
                              <Edit2 className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                            {!tag.isSystem && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 md:h-8 md:w-8 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950"
                                onClick={() => handleDeleteTag(tag.id)}
                              >
                                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredTags.length === 0 && (
              <div className="text-center py-8 md:py-12">
                <TagIcon className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
                <p className="text-xs md:text-sm text-muted-foreground px-4">
                  {searchQuery
                    ? "No tags found matching your search"
                    : "No tags yet. Add your first tag to get started."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddTagModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTag}
      />

      <EditTagModal
        open={!!editingTag}
        tag={editingTag}
        onClose={() => setEditingTag(null)}
        onSubmit={handleUpdateTag}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Tag"
        description={`Are you sure you want to delete the tag "${tagToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}
