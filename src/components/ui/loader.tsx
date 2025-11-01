import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function Loader({ size = "md", text, className }: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <IconLoader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

interface LoaderFullPageProps {
  text?: string;
}

export function LoaderFullPage({ text = "Loading..." }: LoaderFullPageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader size="lg" text={text} />
    </div>
  );
}

interface LoaderInlineProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export function LoaderInline({ text, size = "sm" }: LoaderInlineProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <Loader size={size} text={text} />
    </div>
  );
}
