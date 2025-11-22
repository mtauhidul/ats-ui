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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DEFAULT_PIPELINE_TEMPLATES } from "@/types/pipeline";
import type { Pipeline } from "@/types";
import {
  ArrowRight,
  Briefcase,
  Code,
  Plus,
  Sparkles,
  TrendingUp,
  Layers,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

interface PipelineEmptyStateProps {
  onCreateCustom: () => void;
  onSelectTemplate: (templateKey: string) => void;
  onSelectPipeline?: (pipelineId: string) => void;
  userTemplates?: Pipeline[];
}

const templateIcons = {
  STANDARD: Briefcase,
  TECHNICAL: Code,
  SALES: TrendingUp,
};

export function PipelineEmptyState({
  onCreateCustom,
  onSelectTemplate,
  onSelectPipeline,
  userTemplates = [],
}: PipelineEmptyStateProps) {
  const [isUserTemplatesOpen, setIsUserTemplatesOpen] = useState(true);
  const [isSystemTemplatesOpen, setIsSystemTemplatesOpen] = useState(true);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-6">
      <div className="max-w-5xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Create Your First Pipeline</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Set up a hiring pipeline to track candidates through your
            recruitment process
          </p>
        </div>

        {/* Create Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Custom Pipeline */}
          <Card
            className="border-2 hover:border-primary/50 transition-colors cursor-pointer group h-fit"
            onClick={onCreateCustom}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Custom
                </Badge>
              </div>
              <CardTitle className="text-xl">Build from Scratch</CardTitle>
              <CardDescription className="text-sm">
                Create a completely custom pipeline with your own stages and
                workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Add unlimited custom stages
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Choose colors and icons
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Full control over workflow
                </li>
              </ul>
              <Button
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                variant="outline"
              >
                Create Custom Pipeline
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Templates */}
          <Card className="border-2 transition-colors flex flex-col max-h-[600px]">
            <CardHeader className="pb-4 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-lg bg-blue-500/10 p-2.5">
                  <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Pre-built
                </Badge>
              </div>
              <CardTitle className="text-xl">Use a Template</CardTitle>
              <CardDescription className="text-sm">
                Start with a proven pipeline template and customize as needed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 overflow-y-auto flex-1">
              {/* User Created Templates */}
              {userTemplates.length > 0 && (
                <Collapsible
                  open={isUserTemplatesOpen}
                  onOpenChange={setIsUserTemplatesOpen}
                  className="space-y-2"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
                    <span>Your Templates ({userTemplates.length})</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isUserTemplatesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2">
                    {userTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => onSelectPipeline?.(template.id)}
                        className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-md bg-primary/10 p-2 shrink-0">
                            <Layers className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-sm">
                                {template.name}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {template.stages.length} stages
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {template.description || "Custom template"}
                            </p>
                            <div className="flex gap-1 mt-2">
                              {template.stages.slice(0, 5).map((stage, idx) => (
                                <div
                                  key={idx}
                                  className="h-2 flex-1 rounded-full"
                                  style={{ backgroundColor: stage.color }}
                                  title={stage.name}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
              
              {/* Default System Templates */}
              <Collapsible
                open={isSystemTemplatesOpen}
                onOpenChange={setIsSystemTemplatesOpen}
                className="space-y-2"
              >
                <CollapsibleTrigger className={`flex items-center justify-between w-full text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors ${
                  userTemplates.length > 0 ? "mt-4" : ""
                }`}>
                  <span>System Templates ({Object.keys(DEFAULT_PIPELINE_TEMPLATES).length})</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isSystemTemplatesOpen ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  {Object.entries(DEFAULT_PIPELINE_TEMPLATES).map(
                ([key, template]) => {
                  const Icon = templateIcons[key as keyof typeof templateIcons];
                  return (
                    <button
                      key={key}
                      onClick={() => onSelectTemplate(key)}
                      className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-md bg-primary/10 p-2 shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm">
                              {template.name}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {template.stages.length} stages
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {template.description}
                          </p>
                          <div className="flex gap-1 mt-2">
                            {template.stages.slice(0, 5).map((stage, idx) => (
                              <div
                                key={idx}
                                className="h-2 flex-1 rounded-full"
                                style={{ backgroundColor: stage.color }}
                                title={stage.name}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            You can edit and customize your pipeline anytime after creation
          </p>
        </div>
      </div>
    </div>
  );
}
