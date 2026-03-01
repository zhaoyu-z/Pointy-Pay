"use client";

import { useEffect, useState } from "react";
import { DollarSign, Layers, Megaphone, TrendingUp, WalletMinimal } from "lucide-react";
import { formatUsdcShort } from "@/lib/utils";

interface StatsGridProps {
  treasuryBalance: number | null;
  hasLinkedWallets: boolean | null;
  gatewayBalance: number | null;
  activeCampaigns: number | null;
  totalPaidOut: number | null;
  loading: boolean;
}

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ReactNode;
  accentColor: string;
  glowColor: string;
  loading: boolean;
  index: number;
}

function StatCard({ label, value, sublabel, icon, accentColor, glowColor, loading, index }: StatCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.35)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: `opacity 0.4s ease ${index * 80}ms, transform 0.4s ease ${index * 80}ms, box-shadow 0.2s ease, border-color 0.2s ease`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 40px rgba(0,0,0,0.45), 0 0 20px ${glowColor}`;
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 32px rgba(0,0,0,0.35)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">{label}</p>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
          style={{
            background: glowColor.replace("0.3", "0.12"),
            border: `1px solid ${glowColor.replace("0.3", "0.25")}`,
            boxShadow: `0 0 16px ${glowColor}`,
          }}
        >
          {icon}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-8 w-32 rounded-md animate-shimmer" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="h-3 w-20 rounded-md" style={{ background: "rgba(255,255,255,0.04)" }} />
        </div>
      ) : (
        <div style={{ animation: "count-up-fade 0.5s ease forwards" }}>
          <p
            className="text-2xl font-mono font-bold tabular-nums"
            style={{ color: accentColor, textShadow: `0 0 20px ${glowColor}` }}
          >
            {value}
          </p>
          {sublabel && <p className="mt-1 text-xs text-text-muted">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}

function NoWalletCard({ index }: { index: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="rounded-xl p-5 flex flex-col items-start justify-between cursor-pointer"
      style={{
        background: "linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(255,255,255,0.01) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(251,191,36,0.18)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.35)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: `opacity 0.4s ease ${index * 80}ms, transform 0.4s ease ${index * 80}ms`,
      }}
    >
      <div className="flex items-start justify-between w-full mb-4">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">Wallet Balance</p>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
          style={{
            background: "rgba(251,191,36,0.1)",
            border: "1px solid rgba(251,191,36,0.25)",
            boxShadow: "0 0 16px rgba(251,191,36,0.2)",
          }}
        >
          <WalletMinimal className="h-4 w-4" style={{ color: "#fbbf24" }} />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-warning">No wallet linked</p>
        <p className="mt-1 text-xs text-text-muted">
          Click "Add wallet" in the header to link your Arc Testnet wallet and see your USDC balance here.
        </p>
      </div>
    </div>
  );
}

export function StatsGrid({ treasuryBalance, hasLinkedWallets, gatewayBalance, activeCampaigns, totalPaidOut, loading }: StatsGridProps) {
  const noWallet = !loading && hasLinkedWallets === false;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {noWallet ? (
        <NoWalletCard index={0} />
      ) : (
        <StatCard
          label="Wallet Balance"
          value={`${formatUsdcShort(treasuryBalance ?? 0)} USDC`}
          sublabel="Arc Testnet · Live"
          icon={<DollarSign className="h-4 w-4" style={{ color: "#10b981" }} />}
          accentColor="#10b981"
          glowColor="rgba(16, 185, 129, 0.3)"
          loading={loading}
          index={0}
        />
      )}
      <StatCard
        label="Gateway Balance"
        value={`${formatUsdcShort(gatewayBalance ?? 0)} USDC`}
        sublabel="Cross-chain gateway"
        icon={<Layers className="h-4 w-4" style={{ color: "#38bdf8" }} />}
        accentColor="#38bdf8"
        glowColor="rgba(56, 189, 248, 0.3)"
        loading={loading}
        index={1}
      />
      <StatCard
        label="Active Campaigns"
        value={String(activeCampaigns ?? 0)}
        sublabel="Draft + approved + executing"
        icon={<Megaphone className="h-4 w-4" style={{ color: "#818cf8" }} />}
        accentColor="#818cf8"
        glowColor="rgba(129, 140, 248, 0.3)"
        loading={loading}
        index={2}
      />
      <StatCard
        label="Total Paid Out"
        value={`${formatUsdcShort(totalPaidOut ?? 0)} USDC`}
        sublabel="All completed campaigns"
        icon={<TrendingUp className="h-4 w-4" style={{ color: "#fbbf24" }} />}
        accentColor="#fbbf24"
        glowColor="rgba(251, 191, 36, 0.3)"
        loading={loading}
        index={3}
      />
    </div>
  );
}
