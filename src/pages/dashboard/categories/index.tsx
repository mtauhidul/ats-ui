import { useState } from "react";
import {
  Plus,
  Search,
  Folder,
  FolderTree,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddCategoryModal } from "@/components/modals/add-category-modal";
import { EditCategoryModal } from "@/components/modals/edit-category-modal";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryTree,
} from "@/types/category";
import categoriesData from "@/lib/mock-data/categories.json";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(
    categoriesData.map((category) => ({
      ...category,
      parentId: category.parentId ?? undefined,
      createdAt: new Date(category.createdAt),
      updatedAt: new Date(category.updatedAt),
    }))
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(
    null
  );

  const handleAddCategory = (data: CreateCategoryRequest) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCategories([newCategory, ...categories]);
    toast.success("Category created successfully");
  };

  const handleUpdateCategory = (data: UpdateCategoryRequest) => {
    if (!editingCategory) return;

    setCategories(
      categories.map((category) =>
        category.id === editingCategory.id
          ? { ...category, ...data, updatedAt: new Date() }
          : category
      )
    );
    toast.success("Category updated successfully");
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);

    // Check if category has children
    const hasChildren = categories.some((c) => c.parentId === categoryId);
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

    setCategories(categories.filter((c) => c.id !== categoryId));
    toast.success("Category deleted successfully");
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Build category tree
  const buildCategoryTree = (
    items: Category[],
    parentId: string | null | undefined = null,
    level: number = 0
  ): CategoryTree[] => {
    return items
      .filter((item) => {
        // Handle both null and undefined as "no parent"
        const itemParent = item.parentId ?? null;
        const targetParent = parentId ?? null;
        return itemParent === targetParent;
      })
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((item) => ({
        ...item,
        level,
        children: buildCategoryTree(items, item.id, level + 1),
      }));
  };

  // Filter categories
  const filteredCategories = categories.filter((category) => {
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
  });

  // Build tree from filtered categories
  const categoryTree = buildCategoryTree(filteredCategories);

  // Flatten tree for grid view
  const flattenTree = (tree: CategoryTree[]): CategoryTree[] => {
    return tree.reduce((acc: CategoryTree[], item) => {
      const { children, ...rest } = item;
      return [...acc, rest, ...(children ? flattenTree(children) : [])];
    }, []);
  };

  const flatCategories = flattenTree(categoryTree).sort((a, b) => {
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

  const activeCategories = categories.filter((c) => c.isActive);
  const parentCategories = categories.filter((c) => !c.parentId);

  // Recursive tree renderer
  const renderCategoryTree = (tree: CategoryTree[]) => {
    return tree.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);

      return (
        <div key={category.id}>
          <div
            className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow mb-2"
            style={{
              marginLeft: `${(category.level || 0) * 24}px`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpanded(category.id)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <div className="w-6" />
                )}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-foreground">
                      {category.name}
                    </h3>
                    {category.parentId && (
                      <span className="text-xs text-muted-foreground">
                        (Subcategory)
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${
                        category.isActive
                          ? "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditingCategory(category)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {hasChildren && isExpanded && renderCategoryTree(category.children!)}
        </div>
      );
    });
  };

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
                <Select value={viewMode} onValueChange={(value: "tree" | "grid") => setViewMode(value)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tree">Tree View</SelectItem>
                    <SelectItem value="grid">Grid View</SelectItem>
                  </SelectContent>
                </Select>
                {viewMode === "grid" && (
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
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="rounded-lg border bg-card p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="rounded-md bg-primary/10 p-1.5">
                      <Folder className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Total</span>
                  </div>
                  <p className="text-xl font-bold">{categories.length}</p>
                  <p className="text-xs text-muted-foreground">Categories</p>
                </div>
                <div className="rounded-lg border bg-card p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="rounded-md bg-green-500/10 p-1.5">
                      <Folder className="h-4 w-4 text-green-600 dark:text-green-500" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Active</span>
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
                    <span className="text-xs font-medium text-muted-foreground">Parent</span>
                  </div>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-500">
                    {parentCategories.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Top level</p>
                </div>
              </div>
            </div>

            {/* Categories Display */}
            {viewMode === "tree" ? (
              <div className="space-y-2">
                {categoryTree.length > 0 ? (
                  renderCategoryTree(categoryTree)
                ) : (
                  <div className="text-center py-12">
                    <FolderTree className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "No categories found matching your search"
                        : "No categories yet. Add your first category to get started."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flatCategories.map((category) => (
                  <div
                    key={category.id}
                    className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-medium text-foreground">
                              {category.name}
                            </h3>
                            {category.parentId && (
                              <span className="text-xs text-muted-foreground">
                                (Sub)
                              </span>
                            )}
                          </div>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <span
                        className={`text-xs px-2 py-0.5 rounded border ${
                          category.isActive
                            ? "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {flatCategories.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "No categories found matching your search"
                        : "No categories yet. Add your first category to get started."}
                    </p>
                  </div>
                )}
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