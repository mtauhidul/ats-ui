import { useState } from "react";
import { Plus, Search, Tag as TagIcon, Edit2, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddTagModal } from "@/components/modals/add-tag-modal";
import { EditTagModal } from "@/components/modals/edit-tag-modal";
import type { Tag, CreateTagRequest, UpdateTagRequest } from "@/types/tag";
import tagsData from "@/lib/mock-data/tags.json";
import { toast } from "sonner";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>(
    tagsData.map((tag) => ({
      ...tag,
      createdAt: new Date(tag.createdAt),
      updatedAt: new Date(tag.updatedAt),
    }))
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const handleAddTag = (data: CreateTagRequest) => {
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      ...data,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTags([newTag, ...tags]);
    toast.success("Tag created successfully");
  };

  const handleUpdateTag = (data: UpdateTagRequest) => {
    if (!editingTag) return;

    setTags(
      tags.map((tag) =>
        tag.id === editingTag.id
          ? { ...tag, ...data, updatedAt: new Date() }
          : tag
      )
    );
    toast.success("Tag updated successfully");
    setEditingTag(null);
  };

  const handleDeleteTag = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId);

    if (tag?.isSystem) {
      toast.error("System tags cannot be deleted");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete the tag "${tag?.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setTags(tags.filter((t) => t.id !== tagId));
    toast.success("Tag deleted successfully");
  };

  // Filter and sort tags
  const filteredTags = tags
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
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime();
        default:
          return 0;
      }
    });

  const systemTags = tags.filter((t) => t.isSystem);
  const customTags = tags.filter((t) => !t.isSystem);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Tags
                  </h2>
                  <p className="text-muted-foreground">
                    Manage tags for jobs and candidates
                  </p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tags by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="system">System Tags</SelectItem>
                    <SelectItem value="custom">Custom Tags</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
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
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
                <div className="rounded-lg border bg-gradient-to-br from-card to-muted/20 p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="rounded-md bg-primary/10 p-1.5">
                      <TagIcon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Total
                    </span>
                  </div>
                  <p className="text-xl font-bold">{tags.length}</p>
                  <p className="text-xs text-muted-foreground">Tags</p>
                </div>
                <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100/20 dark:from-blue-950/20 dark:to-blue-900/10 p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="rounded-md bg-blue-500/10 p-1.5">
                      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                      System
                    </span>
                  </div>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {systemTags.length}
                  </p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
                    Built-in tags
                  </p>
                </div>
                <div className="rounded-lg border bg-gradient-to-br from-green-50 to-green-100/20 dark:from-green-950/20 dark:to-green-900/10 p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="rounded-md bg-green-500/10 p-1.5">
                      <TagIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      Custom
                    </span>
                  </div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {customTags.length}
                  </p>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70">
                    User-created
                  </p>
                </div>
              </div>
            </div>

            {/* Tags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                            border: `1px solid ${tag.color}40`,
                          }}
                        >
                          {tag.name}
                        </span>
                      </div>
                      {tag.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {tag.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      {tag.isSystem && (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                          System
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingTag(tag)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {!tag.isSystem && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950"
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTags.length === 0 && (
              <div className="text-center py-12">
                <TagIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
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
    </div>
  );
}