"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ArrowDownToLine, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CHAIN_NAMES } from "@/lib/chain-config";
import { formatUsdc, truncateAddress } from "@/lib/utils";
import { toast } from "sonner";

interface GatewayBalance {
  arcTestnet: number;
  baseSepolia: number;
  avalancheFuji: number;
  total: number;
  gatewayWalletAddress: string;
}

export function BalanceCard() {
  const [balance, setBalance] = useState<GatewayBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gateway/balance");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBalance(data);
    } catch {
      toast.error("Failed to load gateway balance");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    setDepositing(true);
    try {
      const res = await fetch("/api/gateway/deposit", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Deposit failed");
      toast.success("Deposit initiated", {
        description: `Tx: ${truncateAddress(data.txHash, 6)}`,
      });
      await fetchBalance();
    } catch (err: any) {
      toast.error("Deposit failed", { description: err.message });
    } finally {
      setDepositing(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const chainBreakdown: { key: keyof Omit<GatewayBalance, "total" | "gatewayWalletAddress">; label: string }[] = [
    { key: "arcTestnet", label: "Arc Testnet" },
    { key: "baseSepolia", label: "Base Sepolia" },
    { key: "avalancheFuji", label: "Avalanche Fuji" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Gateway Treasury</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchBalance} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeposit} disabled={depositing || loading}>
            <ArrowDownToLine className="h-4 w-4" />
            Deposit to Gateway
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : balance ? (
          <>
            {/* Total balance */}
            <div className="rounded-xl p-4" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", boxShadow: "0 0 24px rgba(16,185,129,0.08)" }}>
              <p className="text-xs text-text-muted mb-1">Total Gateway Balance</p>
              <p className="text-3xl font-mono font-bold text-primary">
                {formatUsdc(balance.total, 2)}
              </p>
              <p className="text-sm text-text-muted mt-0.5">USDC</p>
            </div>

            {/* Per-chain breakdown */}
            <div className="space-y-2">
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                Per-Chain Liquidity
              </p>
              {chainBreakdown.map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" style={{ boxShadow: "0 0 6px rgba(16,185,129,0.5)" }} />
                    <span className="text-sm text-text-primary">{label}</span>
                  </div>
                  <span className="font-mono text-sm text-primary font-medium">
                    {formatUsdc(balance[key], 2)} USDC
                  </span>
                </div>
              ))}
            </div>

            {/* Gateway wallet address */}
            <div className="rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-xs text-text-muted mb-1">Gateway Wallet Address</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-primary">
                  {balance.gatewayWalletAddress}
                </span>
                <a
                  href={`https://testnet.arcscan.app/address/${balance.gatewayWalletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3 text-primary" />
                </a>
              </div>
            </div>

            <div className="rounded-lg px-3 py-2.5" style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)" }}>
              <p className="text-xs text-warning">
                Gateway balance is unified across chains. Funds deposited on Arc Testnet are
                instantly available for cross-chain payouts via Circle Gateway.
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-text-muted text-center py-4">
            Unable to load balance.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
