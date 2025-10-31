import { AddCategoryModal } from "@/components/modals/add-category-modal";
import { EditCategoryModal } from "@/components/modals/edit-category-modal";
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
import { useAppSelector, useCategories } from "@/store/hooks/index";
import { selectCategories } from "@/store/selectors";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category";
import {
  Edit2,
  Folder,
  FolderTree,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CategoriesPage() {
  const { fetchCategories, createCategory, updateCategory, deleteCategory } =
    useCategories();
  const categories = useAppSelector(selectCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAddCategory = (data: CreateCategoryRequest) => {
    createCategory(data);
  };

  const handleUpdateCategory = (data: UpdateCategoryRequest) => {
    if (!editingCategory) return;
    updateCategory(editingCategory.id, data);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(
      (c: { id: string }) => c.id === categoryId
    );

    // Check if category has children
    const hasChildren = categories.some(
      (c: { parentId?: string }) => c.parentId === categoryId
    );
    if (hasChildren) {
      toast.error(
        `Cannot delete "${category?.name}". Please delete all subcategories first.`,
        { duration: 5000 }
      );
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete the category "${category?.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    deleteCategory(categoryId);
  };

  // Filter categories
  const filteredCategories = categories
    .filter((category: Category) => {
      // Search filter
      const matchesSearch =
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.isActive) ||
        (statusFilter === "inactive" && !category.isActive);

      return matchesSearch && matchesStatus;
    })
    .sort((a: Category, b: Category) => {
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

  const activeCategories = categories.filter((c: Category) => c.isActive);
  const parentCategories = categories.filter((c: Category) => !c.parentId);

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
                    Categories
                  </h2>
                  <p className="text-muted-foreground">
                    Organize jobs and candidates with hierarchical categories
                  </p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
                      <Folder className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Total
                    </span>
                  </div>
                  <p className="text-xl font-bold">{categories.length}</p>
                  <p className="text-xs text-muted-foreground">Categories</p>
                </div>
                <div className="rounded-lg border bg-card p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="rounded-md bg-green-500/10 p-1.5">
                      <Folder className="h-4 w-4 text-green-600 dark:text-green-500" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Active
                    </span>
                  </div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-500">
                    {activeCategories.length}
                  </p>
                  <p className="text-xs text-muted-foreground">In use</p>
                </div>
                <div className="rounded-lg border bg-card p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="rounded-md bg-blue-500/10 p-1.5">
                      <FolderTree className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Parent
                    </span>
                  </div>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-500">
                    {parentCategories.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Top level</p>
                </div>
              </div>
            </div>

            {/* Categories Display */}
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCategories.map((category: Category) => {
                  const subcategories = categories.filter(
                    (c: Category) => c.parentId === category.id
                  );

                  return (
                    <Card key={category.id}>
                      <CardHeader className="border-0">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="truncate">{category.name}</span>
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
                                onClick={() => setEditingCategory(category)}
                              >
                                <Edit2 className="h-4 w-4" />
                                Edit Category
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardToolbar>
                      </CardHeader>
                      <CardContent className="space-y-2.5">
                        {category.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">
                            {category.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 pt-2 border-t">
                          {category.isActive ? (
                            <Badge variant="success" appearance="light">
                              <Folder className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" appearance="light">
                              <Folder className="h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                          {category.parentId ? (
                            <Badge variant="info" appearance="light">
                              Subcategory
                            </Badge>
                          ) : (
                            subcategories.length > 0 && (
                              <Badge variant="primary" appearance="light">
                                <FolderTree className="h-3 w-3" />
                                {subcategories.length} Sub
                              </Badge>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No categories found matching your search"
                    : "No categories yet. Add your first category to get started."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddCategoryModal
        open={isAddModalOpen}
        categories={categories}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCategory}
      />

      <EditCategoryModal
        open={!!editingCategory}
        category={editingCategory}
        categories={categories}
        onClose={() => setEditingCategory(null)}
        onSubmit={handleUpdateCategory}
      />
    </div>
  );
}
