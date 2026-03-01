import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CampaignStatus } from "@/types/campaign";

const STEPS: { key: CampaignStatus; label: string }[] = [
  { key: "draft", label: "Draft" },
  { key: "scheduled", label: "Scheduled" },
  { key: "approved", label: "Approved" },
  { key: "executing", label: "Executing" },
  { key: "completed", label: "Completed" },
];

const STATUS_ORDER: Record<CampaignStatus, number> = {
  draft: 0,
  scheduled: 1,
  approved: 2,
  executing: 3,
  completed: 4,
  failed: 4,
};

interface StatusPipelineProps {
  status: CampaignStatus;
}

export function StatusPipeline({ status }: StatusPipelineProps) {
  const currentIdx = STATUS_ORDER[status];
  const isFailed = status === "failed";

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx && !isFailed;
        const isActive = idx === currentIdx && !isFailed;
        const isFuture = idx > currentIdx || isFailed;

        return (
          <div key={step.key} className="flex items-center">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-mono font-bold transition-all",
                  isCompleted && "border-primary/50 bg-primary/10 text-primary",
                  isActive && isFailed && "border-danger bg-danger/10 text-danger",
                  isActive && !isFailed && "border-primary bg-primary text-white",
                  isFuture && !isFailed && "border-white/10 text-text-muted",
                  isFailed && idx < currentIdx && "border-border bg-surface text-text-muted",
                  isFailed && idx === 4 && "border-danger/50 bg-danger/10 text-danger"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <span>{idx + 1}</span>}
              </div>
              <span
                className={cn(
                  "text-xs whitespace-nowrap",
                  isActive && !isFailed && "text-primary font-medium",
                  isCompleted && "text-primary/70",
                  isFuture && "text-text-muted"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 sm:w-12 mx-1 mb-6 transition-colors",
                  idx < currentIdx && !isFailed ? "bg-primary/40" : "bg-white/10"
                )}
              />
            )}
          </div>
        );
      })}

      {isFailed && (
        <div className="ml-4 mb-6">
          <span className="text-xs text-danger font-medium">Failed</span>
        </div>
      )}
    </div>
  );
}
