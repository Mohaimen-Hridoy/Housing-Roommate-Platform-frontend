import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary font-medium",
        secondary: "border-transparent bg-secondary text-secondary-foreground font-medium",
        success: "border-transparent bg-success/15 text-success font-semibold dark:bg-success/20",
        warning: "border-transparent bg-warning/15 text-warning font-semibold dark:bg-warning/20",
        danger: "border-transparent bg-destructive/15 text-destructive font-semibold dark:bg-destructive/20",
        info: "border-transparent bg-primary/12 text-primary font-semibold dark:bg-primary/20",
        accent: "border-transparent bg-accent/40 text-accent-foreground font-semibold dark:bg-accent/30 dark:text-accent-foreground",
        outline: "border-border text-foreground font-medium",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
