import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
  className?: string;
}

/** Read-only star display for reviews and property ratings. */
export function RatingStars({ rating, size = "sm", showValue = true, count, className }: RatingStarsProps) {
  const sizes = { sm: "size-3.5", md: "size-4", lg: "size-5" };
  const rounded = Math.round(rating);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            aria-hidden="true"
            className={cn(sizes[size], index < rounded ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")}
          />
        ))}
      </div>
      {showValue ? (
        <span className="text-sm font-medium tabular-nums text-foreground">{rating.toFixed(1)}</span>
      ) : null}
      {count !== undefined ? <span className="text-xs text-muted-foreground">({count})</span> : null}
    </div>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  className?: string;
}

/** Interactive 1–5 star picker used by the review form. */
export function RatingInput({ value, onChange, error, className }: RatingInputProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={value === starValue}
              aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
              onClick={() => onChange(starValue)}
              className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Star
                className={cn(
                  "size-6 transition-colors",
                  starValue <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
                )}
              />
            </button>
          );
        })}
        {value > 0 ? <span className="ml-2 text-sm text-muted-foreground">{value} / 5</span> : null}
      </div>
      {error ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
