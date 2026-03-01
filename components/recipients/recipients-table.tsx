"use client";

import { Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Recipient } from "@/types/recipient";
import { CHAIN_NAMES } from "@/lib/chain-config";
import type { SupportedChain } from "@/lib/chain-config";
import { formatUsdc, truncateAddress } from "@/lib/utils";

interface RecipientsTableProps {
  recipients: Recipient[];
  onDelete?: (id: string) => void;
}

export function RecipientsTable({ recipients, onDelete }: RecipientsTableProps) {
  if (recipients.length === 0) {
    return (
      <p className="text-sm text-text-muted py-8 text-center">
        No recipients yet. Add one to get started.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Wallet</TableHead>
          <TableHead>Chain</TableHead>
          <TableHead>Default Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recipients.map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              <div>
                <p className="font-medium text-text-primary">{r.name}</p>
                {r.email && <p className="text-xs text-text-muted">{r.email}</p>}
              </div>
            </TableCell>
            <TableCell>
              <span className="font-mono text-xs text-text-muted">
                {truncateAddress(r.wallet_address)}
              </span>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs">
                {CHAIN_NAMES[r.preferred_chain as SupportedChain] ?? r.preferred_chain}
              </Badge>
            </TableCell>
            <TableCell>
              {r.default_amount ? (
                <span className="font-mono text-sm text-primary">
                  {formatUsdc(r.default_amount, 2)} USDC
                </span>
              ) : (
                <span className="text-xs text-text-muted">—</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(r.id)}
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
