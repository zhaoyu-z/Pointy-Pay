export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "approved"
  | "executing"
  | "completed"
  | "failed";

export type CampaignType =
  | "payroll"
  | "revenue_distribution"
  | "fund_settlement";

export type PayoutEntryStatus = "pending" | "executing" | "success" | "failed";

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  type: CampaignType;
  description: string | null;
  total_amount: number;
  status: CampaignStatus;
  scheduled_at: string | null;
  executed_at: string | null;
  policy_min_treasury: number | null;
  policy_requires_approval: boolean;
  created_at: string;
  payout_entries?: PayoutEntry[];
  entry_count?: number;
}

export interface PayoutEntry {
  id: string;
  campaign_id: string;
  recipient_id: string | null;
  recipient_name: string;
  amount: number;
  destination_chain: string;
  destination_address: string;
  status: PayoutEntryStatus;
  tx_hash: string | null;
  error_reason: string | null;
  created_at: string;
}

export interface CreateCampaignPayload {
  name: string;
  type: CampaignType;
  description?: string;
  entries: Array<{
    recipient_id?: string;
    recipient_name: string;
    amount: number;
    destination_chain: string;
    destination_address: string;
  }>;
  policy_min_treasury?: number;
  policy_requires_approval?: boolean;
  scheduled_at?: string;
}

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  payroll: "Payroll",
  revenue_distribution: "Revenue Distribution",
  fund_settlement: "Fund Settlement",
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  approved: "Approved",
  executing: "Executing",
  completed: "Completed",
  failed: "Failed",
};
