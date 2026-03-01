"use client";

import Link from "next/link";
import { ArrowRight, Megaphone, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Campaign, CampaignStatus, CampaignType } from "@/types/campaign";
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_STATUS_LABELS } from "@/types/campaign";
import { formatUsdc, formatDate } from "@/lib/utils";

interface RecentCampaignsProps {
  campaigns: Campaign[];
  loading: boolean;
}

function typeLabel(type: CampaignType) {
  return CAMPAIGN_TYPE_LABELS[type] ?? type;
}

const TYPE_COLORS: Record<string, string> = {
  payroll: "rgba(16, 185, 129, 0.08)",
  revenue_distribution: "rgba(129, 140, 248, 0.08)",
  fund_settlement: "rgba(56, 189, 248, 0.08)",
};

export function RecentCampaigns({ campaigns, loading }: RecentCampaignsProps) {
  return (
    <div
      className="rounded-xl h-full"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.35)",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              background: "rgba(129, 140, 248, 0.12)",
              border: "1px solid rgba(129, 140, 248, 0.2)",
            }}
          >
            <Megaphone className="h-3.5 w-3.5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Recent Campaigns</h3>
            <p className="text-xs text-text-muted">Last 5 payout campaigns</p>
          </div>
        </div>
        <Link
          href="/dashboard/campaigns"
          className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-primary transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Megaphone className="h-5 w-5 text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text-primary">No campaigns yet</p>
            <p className="mt-1 text-xs text-text-muted">Create your first payout campaign to get started</p>
            <Link
              href="/dashboard/campaigns/new"
              className="mt-4 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-all"
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              New Campaign
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {campaigns.map((c, i) => (
              <Link
                key={c.id}
                href={`/dashboard/campaigns/${c.id}`}
                className="flex items-center justify-between rounded-lg px-3 py-3 transition-all duration-150 group"
                style={{
                  border: "1px solid transparent",
                  animationDelay: `${i * 60}ms`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = TYPE_COLORS[c.type] ?? "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.07)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent";
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate group-hover:text-white transition-colors">
                    {c.name}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {typeLabel(c.type)} · {formatDate(c.created_at)}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm font-medium text-text-primary">
                    {formatUsdc(c.total_amount, 2)} USDC
                  </span>
                  <Badge variant={c.status as any}>{CAMPAIGN_STATUS_LABELS[c.status]}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
