"use client";

import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
  variant?: "default" | "destructive" | "warning";
}

/** Inline failure panel — a page never renders blank after an API error. */
export function ErrorState({ title, message, onRetry, className, variant = "warning" }: ErrorStateProps) {
  const t = useTranslation();

  // Resolved after mount: reading `navigator.onLine` during render would give the
  // server and the browser different icons on the first paint.
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!window.navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const Icon = offline ? WifiOff : AlertTriangle;

  return (
    <Alert variant={variant} className={cn("flex-col items-start gap-3 sm:flex-row sm:items-center", className)}>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <div className="flex-1 space-y-0.5">
        <AlertTitle>{offline ? t("state.offlineTitle") : (title ?? t("state.error"))}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0">
          <RefreshCw className="size-4" />
          {t("action.retry")}
        </Button>
      ) : null}
    </Alert>
  );
}
