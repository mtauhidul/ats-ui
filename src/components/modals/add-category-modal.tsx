import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, CreateCategoryRequest } from "@/types/category";
import { useState } from "react";

interface AddCategoryModalProps {
  open: boolean;
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: CreateCategoryRequest) => void;
}

const COLOR_OPTIONS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#ef4444", label: "Red" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#a855f7", label: "Violet" },
];

export function AddCategoryModal({
  open,
  categories,
  onClose,
  onSubmit,
}: AddCategoryModalProps) {
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: "",
    description: "",
    parentId: undefined,
    color: "#3b82f6",
    sortOrder: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get only parent categories (no parentId)
  const parentCategories = categories.filter((c) => !c.parentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      parentId: undefined,
      color: "#3b82f6",
      sortOrder: 0,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            Add New Category
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 md:space-y-4 pt-3 md:pt-4"
        >
          {/* Category Name */}
          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="name" className="text-xs md:text-sm">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              placeholder="e.g., Technology, Marketing, Sales"
              className={`h-8 md:h-9 text-xs md:text-sm ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-xs md:text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="description" className="text-xs md:text-sm">
              Description (Optional)
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the category"
              className="h-8 md:h-9 text-xs md:text-sm"
            />
          </div>

          {/* Parent Category */}
          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="parentId" className="text-xs md:text-sm">
              Parent Category (Optional)
            </Label>
            <Select
              value={formData.parentId || "none"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  parentId: value === "none" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="h-8 md:h-9 text-xs md:text-sm">
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Top Level)</SelectItem>
                {parentCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              Select a parent to create a subcategory
            </p>
          </div>

          {/* Sort Order */}
          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="sortOrder" className="text-xs md:text-sm">
              Sort Order
            </Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sortOrder: parseInt(e.target.value) || 0,
                })
              }
              placeholder="0"
              min="0"
              className="h-8 md:h-9 text-xs md:text-sm"
            />
            <p className="text-[10px] md:text-xs text-muted-foreground">
              Lower numbers appear first
            </p>
          </div>

          {/* Color */}
          <div className="space-y-1.5 md:space-y-2">
            <Label className="text-xs md:text-sm">Color</Label>
            <div className="grid grid-cols-5 gap-1.5 md:gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, color: color.value })
                  }
                  className={`relative h-7 md:h-8 rounded border-2 transition-all ${
                    formData.color === color.value
                      ? "border-foreground scale-105"
                      : "border-transparent hover:border-muted-foreground"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                >
                  {formData.color === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1.5 md:mt-2">
              <Label htmlFor="custom-color" className="text-xs md:text-sm">
                Custom:
              </Label>
              <input
                type="color"
                id="custom-color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="h-6 w-10 md:w-12 rounded border cursor-pointer"
              />
              <span className="text-[10px] md:text-xs text-muted-foreground">
                {(formData.color || "#000000").toUpperCase()}
              </span>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-1.5 md:space-y-2">
            <Label className="text-xs md:text-sm">Preview</Label>
            <div className="rounded border p-2 md:p-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full"
                  style={{ backgroundColor: formData.color }}
                />
                <span className="font-medium text-xs md:text-sm">
                  {formData.name || "Category Name"}
                </span>
                {formData.parentId && (
                  <span className="text-[10px] md:text-xs text-muted-foreground">
                    (Subcategory of{" "}
                    {
                      parentCategories.find((c) => c.id === formData.parentId)
                        ?.name
                    }
                    )
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 md:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Add Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
