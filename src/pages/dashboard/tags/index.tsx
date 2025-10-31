import { AddTagModal } from "@/components/modals/add-tag-modal";
import { EditTagModal } from "@/components/modals/edit-tag-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontal,
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

  const handleAddTag = (data: CreateTagRequest) => {
    createTag(data);
  };

  const handleUpdateTag = (data: UpdateTagRequest) => {
    if (!editingTag) return;
    updateTag(editingTag.id, data);
    setEditingTag(null);
  };

  const handleDeleteTag = (tagId: string) => {
    const tag = tags.find((t: Tag) => t.id === tagId);

    if (tag?.isSystem) {
      toast.error("System tags cannot be deleted");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete the tag "${tag?.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    deleteTag(tagId);
  };

  // Filter and sort tags
  const filteredTags = (tags as Tag[])
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
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="rounded-lg border bg-card p-3 shadow-sm">
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
                <div className="rounded-lg border bg-card p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="rounded-md bg-blue-500/10 p-1.5">
                      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      System
                    </span>
                  </div>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-500">
                    {systemTags.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Built-in tags</p>
                </div>
                <div className="rounded-lg border bg-card p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="rounded-md bg-green-500/10 p-1.5">
                      <TagIcon className="h-4 w-4 text-green-600 dark:text-green-500" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Custom
                    </span>
                  </div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-500">
                    {customTags.length}
                  </p>
                  <p className="text-xs text-muted-foreground">User-created</p>
                </div>
              </div>
            </div>

            {/* Tags Cards */}
            {filteredTags.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredTags.map((tag) => (
                  <Card key={tag.id}>
                    <CardHeader className="border-0">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
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
                      </CardTitle>
                      <CardToolbar>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="dim"
                              size="sm"
                              mode="icon"
                              className="-me-1.5"
                            >
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" side="bottom">
                            <DropdownMenuItem
                              onClick={() => setEditingTag(tag)}
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit Tag
                            </DropdownMenuItem>
                            {!tag.isSystem && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleDeleteTag(tag.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardToolbar>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      {tag.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tag.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        {tag.isSystem ? (
                          <Badge variant="info" appearance="light">
                            <AlertCircle className="h-3 w-3" />
                            System Tag
                          </Badge>
                        ) : (
                          <Badge variant="success" appearance="light">
                            <TagIcon className="h-3 w-3" />
                            Custom Tag
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
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
