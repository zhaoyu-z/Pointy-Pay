"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-surface group-[.toaster]:text-text-primary group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-text-muted",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-surface-hover group-[.toast]:text-text-muted",
          success: "group-[.toaster]:border-primary/30",
          error: "group-[.toaster]:border-danger/30",
          warning: "group-[.toaster]:border-warning/30",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
