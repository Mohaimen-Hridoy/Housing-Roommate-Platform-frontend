"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";

const POPULAR_LOCATIONS = ["Dhaka", "Chittagong", "Sylhet", "Uttara", "Mirpur"];

export function HeroSearch() {
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
    <div className="w-full max-w-xl space-y-3">
      <form
        onSubmit={handleSubmit}
        className="surface-raised edge-light relative flex items-center gap-2 rounded-2xl border border-border/80 bg-card/90 p-2 shadow-lg backdrop-blur-md transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-[0_8px_30px_hsl(var(--shadow-color)/0.18)]"
      >
        <div className="flex flex-1 items-center gap-2.5 pl-3">
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
        <Button type="submit" size="sm" className="h-10 shrink-0 gap-1.5 rounded-xl px-4 font-semibold shadow-md">
          <Search className="size-3.5" aria-hidden="true" />
          <span>{t("common.search") || "Search"}</span>
        </Button>
      </form>

      {/* Quick location chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{t("common.popular") || "Popular"}:</span>
        {POPULAR_LOCATIONS.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => handleLocationClick(loc)}
            className="rounded-full border border-border/60 bg-secondary/50 px-2.5 py-0.5 text-xs transition-colors hover:border-primary/40 hover:bg-secondary hover:text-foreground"
          >
            {loc}
          </button>
        ))}
      </div>
    </div>
  );
}
