"use client";

import Link from "next/link";
import { ArrowRight, History, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUsdcShort, formatDate, truncateAddress } from "@/lib/utils";
import { getTxExplorerUrl } from "@/lib/chain-config";
import type { SupportedChain } from "@/lib/chain-config";

interface TransactionRecord {
  id: string;
  created_at: string;
  chain: string;
  tx_type: string;
  amount: number;
  tx_hash: string | null;
  status: string;
  recipient_address: string | null;
}

interface RecentTransactionsProps {
  transactions: TransactionRecord[];
  loading: boolean;
}

const TX_TYPE_LABELS: Record<string, string> = {
  deposit: "Deposit",
  cross_chain_payout: "Cross-Chain Payout",
  gateway_deposit: "Gateway Deposit",
  nano_send: "Nano Send",
};

export function RecentTransactions({ transactions, loading }: RecentTransactionsProps) {
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
              background: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
            }}
          >
            <History className="h-3.5 w-3.5" style={{ color: "#38bdf8" }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Recent Transactions</h3>
            <p className="text-xs text-text-muted">Last 5 USDC movements</p>
          </div>
        </div>
        <Link
          href="/dashboard/history"
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
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <History className="h-5 w-5 text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text-primary">No transactions yet</p>
            <p className="mt-1 text-xs text-text-muted">Send a payment or run a campaign to see activity here</p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-150"
                style={{ border: "1px solid transparent" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(56, 189, 248, 0.04)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "transparent";
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary">
                      {TX_TYPE_LABELS[tx.tx_type] ?? tx.tx_type}
                    </p>
                    <Badge
                      variant={tx.status === "confirmed" ? "success" : tx.status === "failed" ? "failed" : "outline" as any}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {tx.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{formatDate(tx.created_at)}</p>
                </div>
                <div className="ml-4 flex items-center gap-2 shrink-0">
                  <span className="font-mono text-sm font-medium text-primary">
                    {formatUsdcShort(tx.amount)} USDC
                  </span>
                  {tx.tx_hash && (
                    <a
                      href={getTxExplorerUrl(tx.tx_hash, tx.chain as SupportedChain)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-text-muted hover:text-primary transition-colors"
                      title={truncateAddress(tx.tx_hash, 4)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
