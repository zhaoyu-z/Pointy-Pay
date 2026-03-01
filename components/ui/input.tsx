import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg px-3 py-1 text-sm text-text-primary shadow-sm transition-all duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(16,185,129,0.5)";
          (e.currentTarget as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)";
          (e.currentTarget as HTMLInputElement).style.boxShadow = "none";
          props.onBlur?.(e);
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
