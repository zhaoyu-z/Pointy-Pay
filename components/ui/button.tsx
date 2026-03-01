import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-emerald-400 hover:shadow-lg hover:shadow-primary/25 active:scale-95",
        destructive: "bg-danger text-white hover:bg-red-400 active:scale-95",
        outline: "border border-border bg-transparent hover:bg-surface-hover hover:border-primary/50 text-text-primary active:scale-95",
        secondary: "bg-surface hover:bg-surface-hover text-text-primary border border-border hover:border-primary/30 active:scale-95",
        ghost: "hover:bg-surface-hover text-text-muted hover:text-text-primary active:scale-95",
        link: "text-primary underline-offset-4 hover:underline hover:text-emerald-400",
        accent: "bg-accent text-white hover:bg-indigo-400 hover:shadow-lg hover:shadow-accent/25 active:scale-95",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
