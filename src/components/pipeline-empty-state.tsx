import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEFAULT_PIPELINE_TEMPLATES } from "@/types/pipeline";
import {
  ArrowRight,
  Briefcase,
  Code,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface PipelineEmptyStateProps {
  onCreateCustom: () => void;
  onSelectTemplate: (templateKey: string) => void;
}

const templateIcons = {
  STANDARD: Briefcase,
  TECHNICAL: Code,
  SALES: TrendingUp,
};

export function PipelineEmptyState({
  onCreateCustom,
  onSelectTemplate,
}: PipelineEmptyStateProps) {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Custom Pipeline */}
          <Card
            className="border-2 hover:border-primary/50 transition-colors cursor-pointer group"
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
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
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
            <CardContent className="space-y-3">
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
