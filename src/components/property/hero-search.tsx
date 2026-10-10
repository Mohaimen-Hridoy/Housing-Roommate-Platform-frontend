"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";

import { cn } from "@/lib/utils";

const POPULAR_LOCATIONS = ["Dhaka", "Chittagong", "Sylhet", "Uttara", "Mirpur"];

export function HeroSearch({
  centered = false,
  className = "",
}: {
  centered?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const t = useTranslation();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/properties?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/properties");
    }
  };

  const handleLocationClick = (loc: string) => {
    router.push(`/properties?search=${encodeURIComponent(loc)}`);
  };

  return (
    <div className={cn("w-full max-w-2xl space-y-3.5", centered && "mx-auto", className)}>
      <form
        onSubmit={handleSubmit}
        className="surface-raised edge-light relative flex items-center gap-2 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-xl backdrop-blur-md transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-[0_12px_36px_hsl(var(--shadow-color)/0.18)]"
      >
        <div className="flex flex-1 items-center gap-3 pl-3.5">
          <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("browse.searchPlaceholder") || "City, neighborhood or landmark..."}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Search destination"
          />
        </div>
        <Button type="submit" size="sm" className="h-10 shrink-0 gap-1.5 rounded-xl px-5 font-semibold shadow-md">
          <Search className="size-4" aria-hidden="true" />
          <span>{t("common.search") || "Search"}</span>
        </Button>
      </form>

      {/* Quick location chips */}
      <div className={cn("flex flex-wrap items-center gap-2 text-xs text-muted-foreground", centered && "justify-center")}>
        <span className="font-semibold text-foreground">{t("common.popular") || "Popular"}:</span>
        {POPULAR_LOCATIONS.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => handleLocationClick(loc)}
            className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-medium backdrop-blur-xs transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          >
            {loc}
          </button>
        ))}
      </div>
    </div>
  );
}
