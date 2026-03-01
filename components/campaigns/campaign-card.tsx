"use client";

import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Campaign, CampaignStatus, CampaignType } from "@/types/campaign";
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_STATUS_LABELS } from "@/types/campaign";
import { formatUsdc, formatDate } from "@/lib/utils";

interface CampaignCardProps {
  campaign: Campaign;
}

const TYPE_COLORS: Record<CampaignType, string> = {
  payroll: "text-secondary",
  revenue_distribution: "text-accent",
  fund_settlement: "text-warning",
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const successCount = campaign.payout_entries?.filter((e) => e.status === "success").length ?? 0;
  const totalCount = campaign.payout_entries?.length ?? campaign.entry_count ?? 0;
  const progressPct = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

  return (
    <Link href={`/dashboard/campaigns/${campaign.id}`}>
      <Card className="hover:border-primary/30 transition-colors cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={campaign.status as any}>
                  {CAMPAIGN_STATUS_LABELS[campaign.status]}
                </Badge>
                <span className={`text-xs font-medium ${TYPE_COLORS[campaign.type]}`}>
                  {CAMPAIGN_TYPE_LABELS[campaign.type]}
                </span>
              </div>
              <h3 className="font-semibold text-text-primary truncate">{campaign.name}</h3>
              {campaign.description && (
                <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{campaign.description}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-lg font-bold text-primary">
                {formatUsdc(campaign.total_amount, 2)}
              </p>
              <p className="text-xs text-text-muted">USDC</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {totalCount > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {totalCount} recipients
                  </span>
                  {campaign.status === "executing" || campaign.status === "completed" ? (
                    <span>{successCount}/{totalCount} sent</span>
                  ) : null}
                </div>
                {(campaign.status === "executing" || campaign.status === "completed") && (
                  <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-1 rounded-full transition-all"
                      style={{
                        width: `${progressPct}%`,
                        background: "linear-gradient(90deg, #10b981, #34d399)",
                        boxShadow: "0 0 8px rgba(16,185,129,0.4)",
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>{formatDate(campaign.created_at)}</span>
              <ArrowRight className="h-3 w-3 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
