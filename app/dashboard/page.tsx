"use client";

import { useEffect, useState } from "react";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { TreasuryHealth } from "@/components/dashboard/treasury-health";
import { RecentCampaigns } from "@/components/dashboard/recent-campaigns";
import type { Campaign } from "@/types/campaign";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [gatewayBalance, setGatewayBalance] = useState<number | null>(null);
  const [userWalletBalance, setUserWalletBalance] = useState<number | null>(null);
  const [hasLinkedWallets, setHasLinkedWallets] = useState<boolean | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [totalPaidOut, setTotalPaidOut] = useState<number | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [balanceRes, campaignsRes] = await Promise.allSettled([
          fetch("/api/gateway/balance").then((r) => r.json()),
          fetch("/api/campaigns").then((r) => r.json()),
        ]);

        if (balanceRes.status === "fulfilled") {
          setGatewayBalance(balanceRes.value.total ?? 0);
          setUserWalletBalance(balanceRes.value.userWalletBalance ?? 0);
          setHasLinkedWallets(balanceRes.value.hasLinkedWallets ?? false);
        }

        if (campaignsRes.status === "fulfilled") {
          const all: Campaign[] = campaignsRes.value.campaigns ?? [];
          setCampaigns(all.slice(0, 5));
          const paid = all
            .filter((c) => c.status === "completed")
            .reduce((sum, c) => sum + (c.total_amount ?? 0), 0);
          setTotalPaidOut(paid);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const activeCampaigns = campaigns.filter(
    (c) => c.status === "draft" || c.status === "approved" || c.status === "executing"
  ).length;

  // Upcoming payouts = sum of approved/draft campaign totals
  const upcomingPayouts = campaigns
    .filter((c) => c.status === "approved" || c.status === "draft")
    .reduce((sum, c) => sum + (c.total_amount ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">
          Overview of your USDC payout infrastructure
        </p>
      </div>

      <StatsGrid
        treasuryBalance={userWalletBalance}
        hasLinkedWallets={hasLinkedWallets}
        gatewayBalance={gatewayBalance}
        activeCampaigns={activeCampaigns}
        totalPaidOut={totalPaidOut}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TreasuryHealth
            gatewayBalance={gatewayBalance ?? 0}
            upcomingPayouts={upcomingPayouts}
          />
        </div>
        <div className="lg:col-span-2">
          <RecentCampaigns campaigns={campaigns} loading={loading} />
        </div>
      </div>
    </div>
  );
}
