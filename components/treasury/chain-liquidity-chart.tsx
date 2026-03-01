"use client";

import { PieChart } from "lucide-react";
import { formatUsdcShort } from "@/lib/utils";

interface ChainLiquidityChartProps {
  arcTestnet: number;
  baseSepolia: number;
  avalancheFuji: number;
}

interface Slice {
  label: string;
  value: number;
  color: string;
  glowColor: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  // Clamp to avoid full-circle degenerate path
  const clampedEnd = Math.min(endDeg, startDeg + 359.99);
  const start = polarToCartesian(cx, cy, r, clampedEnd);
  const end = polarToCartesian(cx, cy, r, startDeg);
  const largeArc = clampedEnd - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function ChainLiquidityChart({ arcTestnet, baseSepolia, avalancheFuji }: ChainLiquidityChartProps) {
  const slices: Slice[] = [
    { label: "Arc Testnet", value: arcTestnet, color: "#10b981", glowColor: "rgba(16,185,129,0.4)" },
    { label: "Base Sepolia", value: baseSepolia, color: "#38bdf8", glowColor: "rgba(56,189,248,0.4)" },
    { label: "Avalanche Fuji", value: avalancheFuji, color: "#f59e0b", glowColor: "rgba(245,158,11,0.4)" },
  ];

  const total = slices.reduce((s, slice) => s + slice.value, 0);
  const isEmpty = total === 0;

  const CX = 80;
  const CY = 80;
  const R_OUTER = 64;
  const R_INNER = 42;
  const GAP_DEG = 2;

  // Build arc paths
  let cursor = 0;
  const arcs = slices.map((slice) => {
    const frac = isEmpty ? 0 : slice.value / total;
    const spanDeg = frac * 360;
    const startDeg = cursor;
    const endDeg = cursor + spanDeg;
    cursor = endDeg;
    return { ...slice, startDeg, endDeg, spanDeg };
  });

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.35)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{
            background: "rgba(251,191,36,0.12)",
            border: "1px solid rgba(251,191,36,0.22)",
          }}
        >
          <PieChart className="h-3.5 w-3.5" style={{ color: "#f59e0b" }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Per-Chain Liquidity</h3>
          <p className="text-xs text-text-muted">Gateway USDC distribution by chain</p>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-text-muted">No gateway balance to display</p>
        </div>
      ) : (
        <div className="flex items-center gap-8 flex-wrap">
          {/* SVG donut */}
          <div className="relative shrink-0">
            <svg width={160} height={160} viewBox="0 0 160 160">
              <defs>
                {arcs.map((arc) => (
                  <filter key={`glow-${arc.label}`} id={`glow-${arc.label.replace(/\s/g, "")}`}>
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
              </defs>

              {/* Background ring */}
              <circle
                cx={CX}
                cy={CY}
                r={(R_OUTER + R_INNER) / 2}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={R_OUTER - R_INNER}
              />

              {/* Slices */}
              {arcs.map((arc) => {
                if (arc.spanDeg < 0.1) return null;
                const gapHalf = arc.spanDeg > GAP_DEG * 2 ? GAP_DEG / 2 : 0;
                const outerPath = describeArc(CX, CY, R_OUTER, arc.startDeg + gapHalf, arc.endDeg - gapHalf);
                const innerPath = describeArc(CX, CY, R_INNER, arc.endDeg - gapHalf, arc.startDeg + gapHalf);
                return (
                  <path
                    key={arc.label}
                    d={`${outerPath} L ${polarToCartesian(CX, CY, R_INNER, arc.endDeg - gapHalf).x} ${polarToCartesian(CX, CY, R_INNER, arc.endDeg - gapHalf).y} ${innerPath} Z`}
                    fill={arc.color}
                    opacity={0.9}
                    filter={`url(#glow-${arc.label.replace(/\s/g, "")})`}
                  />
                );
              })}

              {/* Center total */}
              <text
                x={CX}
                y={CY - 6}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                fontWeight="700"
                fontFamily="monospace"
                fill="#f0f4f8"
              >
                {formatUsdcShort(total)}
              </text>
              <text
                x={CX}
                y={CY + 10}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fill="#6b7280"
                letterSpacing="1"
              >
                USDC
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3 min-w-0 flex-1">
            {arcs.map((arc) => {
              const pct = total > 0 ? ((arc.value / total) * 100).toFixed(1) : "0.0";
              return (
                <div key={arc.label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="shrink-0 h-2.5 w-2.5 rounded-full"
                      style={{ background: arc.color, boxShadow: `0 0 6px ${arc.glowColor}` }}
                    />
                    <span className="text-xs text-text-muted truncate">{arc.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs font-medium text-text-primary">
                      {formatUsdcShort(arc.value)}
                    </span>
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(255,255,255,0.06)", color: arc.color }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
