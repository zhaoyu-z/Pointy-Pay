"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WalletSelector } from "@/components/wallet/wallet-selector";
import type { Campaign } from "@/types/campaign";
import { formatUsdc } from "@/lib/utils";
import { useUserWallets } from "@/lib/hooks/useUserWallets";
import { toast } from "sonner";

interface ExecuteDialogProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ExecuteDialog({ campaign, open, onOpenChange, onSuccess }: ExecuteDialogProps) {
  const [loading, setLoading] = useState(false);
  const { wallets } = useUserWallets();
  const [fromWallet, setFromWallet] = useState("");

  // Pre-select first wallet when wallets load
  useEffect(() => {
    if (wallets.length > 0 && !fromWallet) {
      setFromWallet(wallets[0].wallet_address);
    }
  }, [wallets, fromWallet]);

  const handleExecute = async () => {
    setLoading(true);
    const toastId = toast.loading("Executing payouts...", {
      description: `Processing ${campaign.payout_entries?.length ?? 0} recipients`,
    });

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_wallet: fromWallet || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Execution failed");
      }

      const successCount = data.campaign?.payout_entries?.filter((e: any) => e.status === "success").length ?? 0;
      const failCount = data.campaign?.payout_entries?.filter((e: any) => e.status === "failed").length ?? 0;

      toast.success("Execution complete", {
        id: toastId,
        description: `${successCount} successful, ${failCount} failed`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error("Execution failed", { id: toastId, description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const entries = campaign.payout_entries ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        style={{
          background: "rgba(7, 11, 20, 0.97)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        <DialogHeader>
          <DialogTitle>Confirm Payout Execution</DialogTitle>
          <DialogDescription>
            This will execute {entries.length} payout(s) totalling{" "}
            <span className="font-mono text-primary">{formatUsdc(campaign.total_amount, 2)} USDC</span>.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* From wallet selector */}
        <WalletSelector
          wallets={wallets}
          value={fromWallet}
          onChange={setFromWallet}
          label="Source Wallet"
          disabled={loading}
        />

        <div className="space-y-2 max-h-56 overflow-y-auto">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{entry.recipient_name}</p>
                <p className="text-xs text-text-muted font-mono">{entry.destination_chain}</p>
              </div>
              <span className="font-mono text-sm text-primary">{formatUsdc(entry.amount, 2)} USDC</span>
            </div>
          ))}
        </div>

        {campaign.policy_min_treasury && (
          <div
            className="flex items-start gap-2 rounded-lg p-3 text-xs"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "var(--warning)" }}
          >
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Policy requires minimum treasury balance of {formatUsdc(campaign.policy_min_treasury, 2)} USDC.</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleExecute} disabled={loading}>
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Executing...</>
            ) : (
              "Confirm Execute"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
