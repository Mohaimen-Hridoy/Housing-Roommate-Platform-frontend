"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentLivePollerProps {
  active: boolean;
  maxAttempts?: number;
  intervalMs?: number;
}

/**
 * Automatically refreshes the payment return page every few seconds while
 * the backend / Stripe status is still settling, so the user doesn't have to
 * manually hit reload.
 */
export function PaymentLivePoller({
  active,
  maxAttempts = 10,
  intervalMs = 2500,
}: PaymentLivePollerProps) {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!active || attempt >= maxAttempts) return;

    const timer = setTimeout(() => {
      setAttempt((prev) => prev + 1);
      setIsRefreshing(true);
      router.refresh();
      setTimeout(() => setIsRefreshing(false), 800);
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [active, attempt, maxAttempts, intervalMs, router]);

  if (!active) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
      <span className="flex items-center gap-2">
        <RefreshCw
          className={`size-4 ${isRefreshing ? "animate-spin" : "animate-spin [animation-duration:3s]"}`}
          aria-hidden="true"
        />
        <span>
          Verifying payment automatically (checking {attempt + 1}/{maxAttempts})...
        </span>
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => {
          setIsRefreshing(true);
          router.refresh();
          setTimeout(() => setIsRefreshing(false), 800);
        }}
        disabled={isRefreshing}
        className="h-7 text-xs"
      >
        Refresh now
      </Button>
    </div>
  );
}
