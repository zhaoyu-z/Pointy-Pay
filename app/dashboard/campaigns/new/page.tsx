import { CampaignForm } from "@/components/campaigns/campaign-form";

export const metadata = { title: "New Campaign — PointyPay" };

export default function NewCampaignPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">New Campaign</h1>
        <p className="text-sm text-text-muted mt-1">
          Create a batch USDC payout campaign
        </p>
      </div>
      <CampaignForm />
    </div>
  );
}
