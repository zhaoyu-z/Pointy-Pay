"use client";

import { useEffect, useState, useCallback } from "react";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { TreasuryHealth } from "@/components/dashboard/treasury-health";
import { RecentCampaigns } from "@/components/dashboard/recent-campaigns";
import { RecentRecipients } from "@/components/dashboard/recent-recipients";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import type { Campaign } from "@/types/campaign";
import type { Recipient } from "@/types/recipient";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [gatewayBalance, setGatewayBalance] = useState<number | null>(null);
  const [userWalletBalance, setUserWalletBalance] = useState<number | null>(null);
  const [hasLinkedWallets, setHasLinkedWallets] = useState<boolean | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [totalPaidOut, setTotalPaidOut] = useState<number | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const fetchAll = useCallback(async () => {
    try {
      const [balanceRes, campaignsRes, recipientsRes, transactionsRes] = await Promise.allSettled([
        fetch("/api/gateway/balance").then((r) => r.json()),
        fetch("/api/campaigns").then((r) => r.json()),
        fetch("/api/recipients").then((r) => r.json()),
        fetch("/api/transactions?limit=5").then((r) => r.json()),
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

      if (recipientsRes.status === "fulfilled") {
        setRecipients((recipientsRes.value.recipients ?? []).slice(0, 5));
      }

      if (transactionsRes.status === "fulfilled") {
        setRecentTransactions(transactionsRes.value.transactions ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Re-fetch when a wallet is linked via the header modal
  useEffect(() => {
    window.addEventListener("wallet-linked", fetchAll);
    return () => window.removeEventListener("wallet-linked", fetchAll);
  }, [fetchAll]);

  const activeCampaigns = campaigns.filter(
    (c) => c.status === "draft" || c.status === "approved" || c.status === "executing"
  ).length;

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentRecipients recipients={recipients} loading={loading} />
        <RecentTransactions transactions={recentTransactions} loading={loading} />
      </div>
    </div>
  );
}
