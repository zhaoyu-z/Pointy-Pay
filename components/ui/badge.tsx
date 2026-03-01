import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/10 text-primary",
        secondary: "border-border bg-surface text-text-muted",
        destructive: "border-danger/30 bg-danger/10 text-danger",
        warning: "border-warning/30 bg-warning/10 text-warning",
        accent: "border-accent/30 bg-accent/10 text-accent",
        outline: "border-border text-text-muted",
        // Campaign statuses
        draft: "border-white/10 bg-white/5 text-text-muted",
        scheduled: "border-secondary/30 bg-secondary/10 text-secondary",
        approved: "border-accent/30 bg-accent/10 text-accent",
        executing: "border-warning/30 bg-warning/10 text-warning",
        completed: "border-primary/30 bg-primary/10 text-primary",
        failed: "border-danger/30 bg-danger/10 text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const STATUS_DOT_COLORS: Record<string, string> = {
  draft: "bg-text-muted",
  scheduled: "bg-secondary",
  approved: "bg-accent",
  executing: "bg-warning",
  completed: "bg-primary",
  failed: "bg-danger",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  const dotColor = variant ? STATUS_DOT_COLORS[variant] : undefined;
  const isAnimated = variant === "executing";

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dotColor && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {isAnimated && (
            <span
              className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", dotColor)}
              style={{ animation: "status-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }}
            />
          )}
          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", dotColor)} />
        </span>
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
