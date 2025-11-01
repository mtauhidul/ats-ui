import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  createEmailTemplate,
  deleteEmailTemplate as deleteEmailTemplateAPI,
  getEmailTemplates,
  updateEmailTemplate,
} from "@/services/emailTemplate.service";
import { Copy, Edit, Info, Mail, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EmailTemplate {
  id?: string;
  _id?: string;
  name: string;
  subject: string;
  body: string;
  type:
    | "interview"
    | "offer"
    | "rejection"
    | "follow_up"
    | "application_received"
    | "general";
  variables: string[];
  isDefault?: boolean;
  isActive?: boolean;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const availableVariables = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "jobTitle",
  "companyName",
  "department",
  "interviewDate",
  "interviewTime",
  "interviewLocation",
  "startDate",
  "salary",
  "benefits",
  "reviewDays",
  "retentionPeriod",
  "recruiterName",
  "recruiterEmail",
  "recruiterPhone",
];

const templateTypes = [
  { value: "interview", label: "Interview Invitation" },
  { value: "offer", label: "Job Offer" },
  { value: "rejection", label: "Rejection" },
  { value: "follow_up", label: "Follow Up" },
  { value: "general", label: "General" },
];

export function EmailTemplatesSettings() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [deleteTemplate, setDeleteTemplate] = useState<EmailTemplate | null>(
    null
  );

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    type: "general" as EmailTemplate["type"],
  });

  const [customVariable, setCustomVariable] = useState("");
  const [showAddVariable, setShowAddVariable] = useState(false);

  // Fetch templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      // Fetch all templates (both active and inactive)
      const data = await getEmailTemplates({ isActive: undefined });
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load email templates:", error);
      toast.error("Failed to load email templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ name: "", subject: "", body: "", type: "general" });
    setIsAddOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      type: template.type,
    });
    setEditingTemplate(template);
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      await createEmailTemplate({
        name: `${template.name} (Copy)`,
        subject: template.subject,
        body: template.body,
        type: template.type,
      });
      toast.success("Template duplicated successfully");
      await loadTemplates();
    } catch (error) {
      console.error("Failed to duplicate template:", error);
      toast.error("Failed to duplicate template");
    }
  };

  const handleDelete = async () => {
    if (deleteTemplate) {
      try {
        const templateId = deleteTemplate._id || deleteTemplate.id;
        if (!templateId) {
          toast.error("Invalid template ID");
          return;
        }

        await deleteEmailTemplateAPI(templateId);
        toast.success("Template deleted successfully");
        await loadTemplates();
      } catch (error) {
        console.error("Failed to delete template:", error);
        toast.error("Failed to delete template");
      } finally {
        setDeleteTemplate(null);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingTemplate) {
        // Update existing template
        const templateId = editingTemplate._id || editingTemplate.id;
        if (!templateId) {
          toast.error("Invalid template ID");
          return;
        }

        await updateEmailTemplate(templateId, formData);
        toast.success("Template updated successfully");
      } else {
        // Add new template
        await createEmailTemplate(formData);
        toast.success("Template created successfully");
      }

      // Reload templates from server
      await loadTemplates();

      setIsAddOpen(false);
      setEditingTemplate(null);
      setFormData({ name: "", subject: "", body: "", type: "general" });
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Failed to save template");
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.querySelector(
      'textarea[name="body"]'
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.body;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + `{{${variable}}}` + after;
      setFormData({ ...formData, body: newText });

      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + variable.length + 4,
          start + variable.length + 4
        );
      }, 0);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Info Banner */}
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
          <div className="flex gap-2 md:gap-3">
            <Info className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm text-blue-900 dark:text-blue-100 min-w-0">
              <p className="font-medium mb-1">Email Template Variables</p>
              <p className="text-blue-700 dark:text-blue-300">
                Use variables like{" "}
                <Badge
                  variant="secondary"
                  className="mx-1 text-[10px] md:text-xs"
                >
                  {"{{firstName}}"}
                </Badge>{" "}
                in your templates. They will be automatically replaced with
                actual values when sending emails.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
        <div className="min-w-0">
          <h3 className="text-base md:text-lg font-semibold">
            Email Templates
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Create and manage reusable email templates with dynamic variables
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="w-full sm:w-auto shrink-0 h-9 md:h-10 text-sm"
        >
          <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
          Add Template
        </Button>
      </div>

      <div className="grid gap-3 md:gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 md:py-12 p-3 md:p-6">
              <div className="text-center space-y-2 md:space-y-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground animate-pulse" />
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Loading templates...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="py-8 md:py-12 p-3 md:p-6">
              <div className="text-center space-y-2 md:space-y-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                </div>
                <h3 className="text-base md:text-lg font-semibold">
                  No Templates Yet
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
                  Create your first email template to streamline candidate
                  communication
                </p>
                <Button onClick={handleAdd} className="h-9 md:h-10 text-sm">
                  <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card
              key={template._id || template.id}
              className="hover:shadow-md transition-shadow overflow-hidden"
            >
              <CardHeader className="p-3 md:p-6">
                <div className="flex items-start justify-between gap-2 md:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-1.5 flex-wrap">
                      <Mail className="h-3 w-3 md:h-4 md:w-4 text-primary shrink-0" />
                      <CardTitle className="text-sm md:text-base truncate break-all">
                        {template.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="capitalize text-[10px] md:text-xs shrink-0 whitespace-nowrap"
                      >
                        {template.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <CardDescription className="truncate text-xs md:text-sm break-all">
                      {template.subject}
                    </CardDescription>
                  </div>
                  <div className="flex gap-0.5 md:gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(template)}
                      className="h-7 w-7 md:h-8 md:w-8 p-0"
                      title="Edit template"
                    >
                      <Edit className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(template)}
                      className="h-7 w-7 md:h-8 md:w-8 p-0"
                      title="Duplicate template"
                    >
                      <Copy className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTemplate(template)}
                      className="h-7 w-7 md:h-8 md:w-8 p-0 text-destructive hover:text-destructive"
                      title="Delete template"
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="space-y-2 md:space-y-3">
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-3 wrap-break-word overflow-hidden">
                    {template.body}
                  </p>
                  {template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 md:gap-1.5 overflow-hidden">
                      {template.variables.map((v) => (
                        <Badge
                          key={v}
                          variant="secondary"
                          className="text-[10px] md:text-xs font-mono max-w-full truncate"
                        >
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs text-muted-foreground pt-1.5 md:pt-2 border-t flex-wrap overflow-hidden">
                    {template.createdAt && (
                      <span className="shrink-0">
                        Created:{" "}
                        {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    {template.createdAt && template.updatedAt && (
                      <span className="hidden sm:inline shrink-0">•</span>
                    )}
                    {template.updatedAt && (
                      <span className="shrink-0">
                        Updated:{" "}
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddOpen || !!editingTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingTemplate(null);
            setFormData({ name: "", subject: "", body: "", type: "general" });
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 shrink-0">
            <DialogTitle className="text-base md:text-xl">
              {editingTemplate
                ? "Edit Email Template"
                : "Create Email Template"}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Create reusable email templates with dynamic variables
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4 md:pb-6 min-h-0">
            <div className="space-y-3 md:space-y-4">
              {/* Name and Type */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs md:text-sm">
                    Template Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Interview Invitation"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="h-9 md:h-10 text-xs md:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs md:text-sm">
                    Template Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        type: value as EmailTemplate["type"],
                      })
                    }
                  >
                    <SelectTrigger
                      id="type"
                      className="h-9 md:h-10 text-xs md:text-sm"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="text-xs md:text-sm"
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-xs md:text-sm">
                  Email Subject <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subject"
                  placeholder="e.g., Interview Invitation - {{jobTitle}}"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="h-9 md:h-10 text-xs md:text-sm"
                />
              </div>

              {/* Body */}
              <div className="space-y-1.5">
                <Label htmlFor="body" className="text-xs md:text-sm">
                  Email Body <span className="text-destructive">*</span>
                </Label>
                <textarea
                  id="body"
                  name="body"
                  rows={8}
                  className="flex w-full rounded-md border border-input bg-background px-2 md:px-3 py-2 text-xs md:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Dear {{firstName}},&#10;&#10;We are pleased to inform you...&#10;&#10;Best regards,&#10;{{recruiterName}}"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                />
              </div>

              {/* Variables Section - Simplified */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Label className="text-xs md:text-sm">
                    Available Variables
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddVariable(!showAddVariable)}
                    className="h-6 md:h-7 text-[10px] md:text-xs px-2"
                  >
                    <Plus className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                    <span className="hidden sm:inline">
                      Add Custom Variable
                    </span>
                    <span className="sm:hidden">Custom</span>
                  </Button>
                </div>

                {/* Instructions */}
                <div className="text-[10px] md:text-xs text-muted-foreground bg-muted/30 rounded-md p-2 space-y-0.5">
                  <p className="font-medium text-foreground">
                    How to use variables:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    <li className="wrap-break-word">
                      Click any variable button below to insert it at your
                      cursor position
                    </li>
                    <li className="wrap-break-word">
                      Variables like{" "}
                      <code className="bg-background px-1 py-0.5 rounded text-primary text-[9px] md:text-[10px]">
                        {"{{firstName}}"}
                      </code>{" "}
                      will be replaced with real data
                    </li>
                  </ul>
                </div>

                {showAddVariable && (
                  <div className="flex gap-1.5 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <Input
                      placeholder="e.g., customField"
                      value={customVariable}
                      onChange={(e) => setCustomVariable(e.target.value)}
                      className="h-8 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customVariable.trim()) {
                          insertVariable(customVariable.trim());
                          setCustomVariable("");
                          setShowAddVariable(false);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (customVariable.trim()) {
                          insertVariable(customVariable.trim());
                          setCustomVariable("");
                          setShowAddVariable(false);
                        }
                      }}
                      className="h-8 text-xs shrink-0 px-3"
                    >
                      Insert
                    </Button>
                  </div>
                )}

                <div className="border rounded-lg p-2 bg-muted/50 max-h-[120px] md:max-h-[150px] overflow-y-auto">
                  <div className="flex flex-wrap gap-1 md:gap-1.5">
                    {availableVariables.map((variable) => (
                      <Button
                        key={variable}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-[10px] md:text-xs font-mono h-6 md:h-7 px-2 md:px-3 bg-background"
                        onClick={() => insertVariable(variable)}
                      >
                        {variable}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-4 md:px-6 py-3 md:py-4 border-t flex-col-reverse sm:flex-row gap-2 sm:gap-0 shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditingTemplate(null);
                setFormData({
                  name: "",
                  subject: "",
                  body: "",
                  type: "general",
                });
              }}
              className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm"
            >
              {editingTemplate ? "Update Template" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTemplate}
        onOpenChange={() => setDeleteTemplate(null)}
      >
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base md:text-lg">
              Delete Email Template?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs md:text-sm">
              Are you sure you want to delete "{deleteTemplate?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
