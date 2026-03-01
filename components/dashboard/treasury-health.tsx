"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, TrendingUp, Droplets } from "lucide-react";
import { formatUsdcShort } from "@/lib/utils";

interface TreasuryHealthProps {
  gatewayBalance: number;
  upcomingPayouts: number;
}

export function TreasuryHealth({ gatewayBalance, upcomingPayouts }: TreasuryHealthProps) {
  const [usycBalance, setUsycBalance] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchUsyc = async () => {
      try {
        const res = await fetch("/api/gateway/balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data = await res.json();
          setUsycBalance(data.usycBalance ?? 0);
        }
      } catch {
        // Non-critical
      }
    };
    fetchUsyc();
  }, []);

  const totalAssets = gatewayBalance + usycBalance;
  const liquidRatio = totalAssets > 0 ? (gatewayBalance / totalAssets) * 100 : 100;

  let healthColor = "#10b981";
  let healthLabel = "Healthy";
  let glowColor = "rgba(16, 185, 129, 0.4)";

  if (liquidRatio < 30) {
    healthColor = "#f43f5e";
    healthLabel = "Critical";
    glowColor = "rgba(244, 63, 94, 0.4)";
  } else if (liquidRatio < 60) {
    healthColor = "#fbbf24";
    healthLabel = "Moderate";
    glowColor = "rgba(251, 191, 36, 0.4)";
  }

  const isPayoutWarning = upcomingPayouts > gatewayBalance;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (liquidRatio / 100) * circumference;

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
      <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <Droplets className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Treasury Health</h3>
            <p className="text-xs text-text-muted">Liquidity vs USYC yield</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-5">
          {/* Ring gauge */}
          <div className="relative flex-shrink-0">
            <svg width="124" height="124" viewBox="0 0 124 124">
              {/* Outer glow ring */}
              <circle
                cx="62" cy="62" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="10"
              />
              {/* Health ring */}
              <circle
                cx="62" cy="62" r={radius}
                fill="none"
                stroke={healthColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={mounted ? strokeDashoffset : circumference}
                transform="rotate(-90 62 62)"
                style={{
                  transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
                  filter: `drop-shadow(0 0 6px ${glowColor})`,
                }}
              />
              {/* Center text */}
              <text x="62" y="57" textAnchor="middle" fill={healthColor} fontSize="20" fontWeight="700" fontFamily="monospace">
                {Math.round(liquidRatio)}%
              </text>
              <text x="62" y="73" textAnchor="middle" fill="#4d607f" fontSize="10" fontWeight="500" letterSpacing="0.5">
                {healthLabel.toUpperCase()}
              </text>
            </svg>
          </div>

          {/* Breakdown */}
          <div className="flex-1 space-y-3 min-w-0">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Liquid USDC</span>
                <span className="font-mono text-primary font-medium">{formatUsdcShort(gatewayBalance)}</span>
              </div>
              <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-1 rounded-full transition-all duration-700"
                  style={{
                    width: mounted ? `${totalAssets > 0 ? (gatewayBalance / totalAssets) * 100 : 0}%` : "0%",
                    background: "linear-gradient(90deg, #10b981, #34d399)",
                    boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)",
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">USYC Holdings</span>
                <span className="font-mono text-accent font-medium">{formatUsdcShort(usycBalance)}</span>
              </div>
              <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-1 rounded-full transition-all duration-700"
                  style={{
                    width: mounted ? `${totalAssets > 0 ? (usycBalance / totalAssets) * 100 : 0}%` : "0%",
                    background: "linear-gradient(90deg, #818cf8, #a5b4fc)",
                    boxShadow: "0 0 8px rgba(129, 140, 248, 0.5)",
                  }}
                />
              </div>
            </div>

            {upcomingPayouts > 0 && (
              <div
                className="flex items-center gap-2 rounded-lg p-2.5 text-xs"
                style={{
                  background: isPayoutWarning ? "rgba(244, 63, 94, 0.08)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isPayoutWarning ? "rgba(244, 63, 94, 0.2)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {isPayoutWarning && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-danger" />}
                <span className={isPayoutWarning ? "text-danger" : "text-text-muted"}>
                  {isPayoutWarning
                    ? `${formatUsdcShort(upcomingPayouts)} USDC exceeds balance`
                    : `${formatUsdcShort(upcomingPayouts)} USDC upcoming`}
                </span>
              </div>
            )}

            <a
              href="https://usyc.dev.hashnote.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
            >
              <TrendingUp className="h-3 w-3" />
              Earn yield via USYC
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
