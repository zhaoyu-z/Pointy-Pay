"use client";

import Link from "next/link";
import { ArrowRight, UserCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CHAIN_NAMES } from "@/lib/chain-config";
import type { SupportedChain } from "@/lib/chain-config";
import { formatUsdc, truncateAddress } from "@/lib/utils";
import type { Recipient } from "@/types/recipient";

interface RecentRecipientsProps {
  recipients: Recipient[];
  loading: boolean;
}

export function RecentRecipients({ recipients, loading }: RecentRecipientsProps) {
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
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <UserCheck className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Recent Recipients</h3>
            <p className="text-xs text-text-muted">Last 5 saved recipients</p>
          </div>
        </div>
        <Link
          href="/dashboard/recipients"
          className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-primary transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : recipients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Users className="h-5 w-5 text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text-primary">No recipients yet</p>
            <p className="mt-1 text-xs text-text-muted">Save recipients for quick reuse in campaigns</p>
            <Link
              href="/dashboard/recipients"
              className="mt-4 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-all"
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Add Recipient
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {recipients.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-150"
                style={{ border: "1px solid transparent" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(16, 185, 129, 0.05)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "transparent";
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate">{r.name}</p>
                  <p className="font-mono text-xs text-text-muted mt-0.5">
                    {truncateAddress(r.wallet_address)}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2 shrink-0">
                  {r.default_amount ? (
                    <span className="font-mono text-xs font-medium text-primary">
                      {formatUsdc(r.default_amount, 2)} USDC
                    </span>
                  ) : null}
                  <Badge variant="outline" className="text-xs">
                    {CHAIN_NAMES[r.preferred_chain as SupportedChain] ?? r.preferred_chain}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
