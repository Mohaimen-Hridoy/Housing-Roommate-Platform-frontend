"use client";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/components/providers/locale-provider";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
};

/** Compact language switcher. Writes a cookie so SSR renders the chosen locale. */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-1.5 px-2.5", className)}
          aria-label={`Language: ${LANGUAGE_NAMES[locale]}`}
        >
          <Languages className="size-4" aria-hidden="true" />
          <span className="text-xs font-semibold">{LOCALE_LABEL[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {LOCALES.map((option) => (
          <DropdownMenuItem
            key={option}
            onSelect={() => setLocale(option)}
            aria-current={option === locale}
            className={cn("justify-between gap-3", option === locale && "bg-accent font-medium")}
          >
            <span>{LANGUAGE_NAMES[option]}</span>
            <span className="text-xs text-muted-foreground">{LOCALE_LABEL[option]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}