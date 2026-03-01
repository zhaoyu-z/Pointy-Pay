"use client";

import { useEffect, useState } from "react";
import { BalanceCard } from "@/components/treasury/balance-card";
import { TreasuryHealth } from "@/components/dashboard/treasury-health";
import { ChainLiquidityChart } from "@/components/treasury/chain-liquidity-chart";

export default function TreasuryPage() {
  const [gatewayBalance, setGatewayBalance] = useState(0);
  const [upcomingPayouts, setUpcomingPayouts] = useState(0);
  const [arcBalance, setArcBalance] = useState(0);
  const [baseBalance, setBaseBalance] = useState(0);
  const [fujiBalance, setFujiBalance] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balRes, campRes] = await Promise.allSettled([
          fetch("/api/gateway/balance").then((r) => r.json()),
          fetch("/api/campaigns").then((r) => r.json()),
        ]);

        if (balRes.status === "fulfilled") {
          setGatewayBalance(balRes.value.total ?? 0);
          setArcBalance(balRes.value.arcTestnet ?? 0);
          setBaseBalance(balRes.value.baseSepolia ?? 0);
          setFujiBalance(balRes.value.avalancheFuji ?? 0);
        }

        if (campRes.status === "fulfilled") {
          const pending = (campRes.value.campaigns ?? [])
            .filter((c: any) => c.status === "approved" || c.status === "draft")
            .reduce((sum: number, c: any) => sum + (c.total_amount ?? 0), 0);
          setUpcomingPayouts(pending);
        }
      } catch {
        // Non-fatal
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Treasury</h1>
        <p className="text-sm text-text-muted mt-1">
          Monitor and manage your Circle Gateway USDC balance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceCard />
        <TreasuryHealth gatewayBalance={gatewayBalance} upcomingPayouts={upcomingPayouts} />
      </div>

      <ChainLiquidityChart
        arcTestnet={arcBalance}
        baseSepolia={baseBalance}
        avalancheFuji={fujiBalance}
      />

      {/* USYC link */}
      <div className="rounded-xl p-5 glass-card" style={{ borderColor: "rgba(129,140,248,0.2)" }}>
        <h2 className="text-sm font-semibold text-accent mb-1">Yield on Idle USDC</h2>
        <p className="text-xs text-text-muted mb-3">
          Deposit idle USDC into Hashnote USYC on Arc Testnet to earn yield while maintaining
          liquidity for payouts. USYC is redeemable 1:1 for USDC.
        </p>
        <a
          href="https://usyc.dev.hashnote.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:underline font-medium"
        >
          Open Hashnote USYC →
        </a>
      </div>
    </div>
  );
}
