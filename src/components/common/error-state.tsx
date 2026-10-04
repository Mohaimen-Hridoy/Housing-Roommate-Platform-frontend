import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
  variant?: "default" | "destructive" | "warning";
}

/** Inline failure panel — a page never renders blank after an API error. */
export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
  variant = "warning",
}: ErrorStateProps) {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  const Icon = offline ? WifiOff : AlertTriangle;

  return (
    <Alert variant={variant} className={cn("flex-col items-start gap-3 sm:flex-row sm:items-center", className)}>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <div className="flex-1 space-y-0.5">
        <AlertTitle>{offline ? "You appear to be offline" : title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0">
          <RefreshCw className="size-4" />
          Try again
        </Button>
      ) : null}
    </Alert>
  );
}
