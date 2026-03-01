"use client";

import { ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { PayoutEntry } from "@/types/campaign";
import { CHAIN_NAMES, getTxExplorerUrl } from "@/lib/chain-config";
import type { SupportedChain } from "@/lib/chain-config";
import { formatUsdc, truncateAddress } from "@/lib/utils";

interface PayoutEntriesTableProps {
  entries: PayoutEntry[];
}

export function PayoutEntriesTable({ entries }: PayoutEntriesTableProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-text-muted py-4 text-center">No payout entries found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Recipient</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tx Hash</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>
              <div>
                <p className="font-medium text-text-primary">{entry.recipient_name}</p>
                <p className="text-xs text-text-muted font-mono">{truncateAddress(entry.destination_address)}</p>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs">
                {CHAIN_NAMES[entry.destination_chain as SupportedChain] ?? entry.destination_chain}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono text-primary">
              {formatUsdc(entry.amount, 2)} USDC
            </TableCell>
            <TableCell>
              <Badge variant={entry.status as any}>{entry.status}</Badge>
            </TableCell>
            <TableCell>
              {entry.tx_hash ? (
                <a
                  href={getTxExplorerUrl(entry.tx_hash, entry.destination_chain as SupportedChain)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline font-mono"
                >
                  {truncateAddress(entry.tx_hash, 4)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : entry.error_reason ? (
                <span className="text-xs text-danger">{entry.error_reason.slice(0, 40)}</span>
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
