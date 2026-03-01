"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { StatusPipeline } from "@/components/campaigns/status-pipeline";
import { PayoutEntriesTable } from "@/components/campaigns/payout-entries-table";
import { ExecuteDialog } from "@/components/campaigns/execute-dialog";
import type { Campaign } from "@/types/campaign";
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_STATUS_LABELS } from "@/types/campaign";
import { formatUsdc, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [executeOpen, setExecuteOpen] = useState(false);

  const fetchCampaign = useCallback(async () => {
    try {
      const res = await fetch(`/api/campaigns/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCampaign(data.campaign);
    } catch {
      toast.error("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCampaign(data.campaign);
      toast.success("Campaign approved");
    } catch (err: any) {
      toast.error("Approval failed", { description: err.message });
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-text-muted">Campaign not found.</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/campaigns")}>
          Back to Campaigns
        </Button>
      </div>
    );
  }

  const canApprove = campaign.status === "draft" || campaign.status === "scheduled";
  const canExecute = campaign.status === "approved" || (campaign.status === "draft" && !campaign.policy_requires_approval);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button + title */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/campaigns")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{campaign.name}</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {CAMPAIGN_TYPE_LABELS[campaign.type]} · Created {formatDate(campaign.created_at)}
          </p>
        </div>
      </div>

      {/* Status pipeline */}
      <Card>
        <CardContent className="pt-6">
          <StatusPipeline status={campaign.status} />
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-text-muted">Total Amount</p>
            <p className="font-mono text-xl font-bold text-primary mt-1">
              {formatUsdc(campaign.total_amount, 2)}
            </p>
            <p className="text-xs text-text-muted">USDC</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-text-muted">Recipients</p>
            <p className="text-xl font-bold text-text-primary mt-1">
              {campaign.payout_entries?.length ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-text-muted">Status</p>
            <div className="mt-1">
              <Badge variant={campaign.status as any}>
                {CAMPAIGN_STATUS_LABELS[campaign.status]}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-text-muted">Requires Approval</p>
            <p className="text-xl font-bold text-text-primary mt-1">
              {campaign.policy_requires_approval ? "Yes" : "No"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {canApprove && campaign.policy_requires_approval && (
          <Button onClick={handleApprove} disabled={approving} variant="outline">
            {approving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Approving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" /> Approve Campaign
              </>
            )}
          </Button>
        )}
        {canExecute && (
          <Button onClick={() => setExecuteOpen(true)}>
            <Play className="h-4 w-4" /> Execute Payouts
          </Button>
        )}
      </div>

      <Separator />

      {/* Payout entries */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <PayoutEntriesTable entries={campaign.payout_entries ?? []} />
        </CardContent>
      </Card>

      {campaign && (
        <ExecuteDialog
          campaign={campaign}
          open={executeOpen}
          onOpenChange={setExecuteOpen}
          onSuccess={fetchCampaign}
        />
      )}
    </div>
  );
}
