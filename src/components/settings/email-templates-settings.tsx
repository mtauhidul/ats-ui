import { useState } from "react";
import { Plus, Mail, Edit, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: "interview" | "offer" | "rejection" | "follow_up" | "general";
  variables: string[];
}

const mockTemplates: EmailTemplate[] = [
  {
    id: "tmpl-1",
    name: "Interview Invitation",
    subject: "Interview Invitation - {{jobTitle}}",
    body: "Hi {{firstName}},\n\nWe're impressed with your application and would like to invite you for an interview for the {{jobTitle}} position.\n\nBest regards,\n{{recruiterName}}",
    type: "interview",
    variables: ["firstName", "jobTitle", "recruiterName"]
  },
  {
    id: "tmpl-2",
    name: "Offer Letter",
    subject: "Job Offer - {{jobTitle}} at {{companyName}}",
    body: "Dear {{firstName}} {{lastName}},\n\nWe are pleased to offer you the position of {{jobTitle}}.\n\nSincerely,\n{{recruiterName}}",
    type: "offer",
    variables: ["firstName", "lastName", "jobTitle", "companyName", "recruiterName"]
  }
];

export function EmailTemplatesSettings() {
  const [templates] = useState<EmailTemplate[]>(mockTemplates);
  const [, setIsAddOpen] = useState(false);
  const [, setEditingTemplate] = useState<EmailTemplate | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Email Templates</h3>
          <p className="text-sm text-muted-foreground">
            Manage reusable email templates
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {template.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {template.subject}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingTemplate(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {template.body.substring(0, 150)}...
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((v) => (
                    <Badge key={v} variant="secondary">
                      {`{{${v}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
