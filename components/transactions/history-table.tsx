"use client";

import { ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CHAIN_NAMES, getTxExplorerUrl } from "@/lib/chain-config";
import type { SupportedChain } from "@/lib/chain-config";
import { formatUsdc, truncateAddress, formatDate } from "@/lib/utils";

interface TransactionRecord {
  id: string;
  created_at: string;
  chain: string;
  tx_type: string;
  amount: number;
  tx_hash: string | null;
  status: string;
  destination_chain: string | null;
  recipient_address: string | null;
  gateway_wallet_address: string | null;
  reason: string | null;
}

interface HistoryTableProps {
  transactions: TransactionRecord[];
}

const TX_TYPE_LABELS: Record<string, string> = {
  deposit: "Deposit",
  cross_chain_payout: "Cross-Chain Payout",
  gateway_deposit: "Gateway Deposit",
  nano_send: "Nano Send",
};

export function HistoryTable({ transactions }: HistoryTableProps) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-text-muted py-8 text-center">
        No transaction history yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>From</TableHead>
          <TableHead>Chain</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tx Hash</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="text-xs text-text-muted">
              {formatDate(tx.created_at)}
            </TableCell>
            <TableCell>
              <span className="text-sm text-text-primary">
                {TX_TYPE_LABELS[tx.tx_type] ?? tx.tx_type}
              </span>
              {tx.recipient_address && (
                <p className="text-xs text-text-muted font-mono mt-0.5">
                  → {truncateAddress(tx.recipient_address)}
                </p>
              )}
            </TableCell>
            <TableCell>
              {tx.gateway_wallet_address ? (
                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://testnet.arcscan.app/address/${tx.gateway_wallet_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-text-muted hover:text-primary transition-colors"
                  >
                    {truncateAddress(tx.gateway_wallet_address, 4)}
                  </a>
                </div>
              ) : (
                <span className="text-xs text-text-muted">—</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <Badge variant="outline" className="text-xs w-fit">
                  {CHAIN_NAMES[tx.chain as SupportedChain] ?? tx.chain}
                </Badge>
                {tx.destination_chain && tx.destination_chain !== tx.chain && (
                  <Badge variant="outline" className="text-xs w-fit opacity-60">
                    → {CHAIN_NAMES[tx.destination_chain as SupportedChain] ?? tx.destination_chain}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right font-mono text-primary font-medium">
              {formatUsdc(tx.amount, 2)} USDC
            </TableCell>
            <TableCell>
              <Badge
                variant={tx.status === "confirmed" ? "success" : tx.status === "failed" ? "failed" : "outline" as any}
              >
                {tx.status}
              </Badge>
            </TableCell>
            <TableCell>
              {tx.tx_hash ? (
                <a
                  href={getTxExplorerUrl(tx.tx_hash, tx.chain as SupportedChain)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline font-mono"
                >
                  {truncateAddress(tx.tx_hash, 4)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : tx.reason ? (
                <span className="text-xs text-danger">{tx.reason.slice(0, 40)}</span>
              ) : (
                <span className="text-xs text-text-muted">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
