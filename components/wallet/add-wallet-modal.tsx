"use client";

import { useState } from "react";
import { Loader2, Trash2, ExternalLink, Plus, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { truncateAddress, formatUsdcShort } from "@/lib/utils";
import type { LinkedWallet } from "@/lib/hooks/useUserWallets";
import { toast } from "sonner";

interface AddWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: LinkedWallet[];
  onAdd: (address: string, label?: string) => Promise<{ error?: string }>;
  onRemove: (id: string) => Promise<{ error?: string }>;
}

export function AddWalletModal({ open, onOpenChange, wallets, onAdd, onRemove }: AddWalletModalProps) {
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    const { error } = await onAdd(address.trim(), label.trim() || undefined);
    setAdding(false);
    if (error) {
      toast.error("Failed to add wallet", { description: error });
    } else {
      toast.success("Wallet linked successfully");
      setAddress("");
      setLabel("");
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    const { error } = await onRemove(id);
    setRemovingId(null);
    if (error) {
      toast.error("Failed to remove wallet", { description: error });
    } else {
      toast.success("Wallet removed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" style={{
        background: "rgba(7, 11, 20, 0.97)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Manage Wallets
          </DialogTitle>
          <DialogDescription>
            Link your Arc Testnet wallet to track balances and select it as the source for payouts.
          </DialogDescription>
        </DialogHeader>

        {/* Existing wallets */}
        {wallets.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Linked Wallets
            </p>
            {wallets.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between rounded-lg px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="min-w-0 flex-1">
                  {w.label && (
                    <p className="text-xs font-medium text-text-primary truncate">{w.label}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs text-text-muted">{truncateAddress(w.wallet_address, 6)}</p>
                    <a
                      href={`https://testnet.arcscan.app/address/${w.wallet_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-emerald-400 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  {w.usdc_balance !== null && (
                    <p className="text-xs text-primary font-mono mt-0.5">
                      {formatUsdcShort(w.usdc_balance)} USDC
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(w.id)}
                  disabled={removingId === w.id}
                  className="ml-2 p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                >
                  {removingId === w.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new wallet form */}
        <div
          className="rounded-xl p-4 space-y-4"
          style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)" }}
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add New Wallet
          </p>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-text-muted uppercase tracking-wider">Network</Label>
              <Select value="arcTestnet" disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arcTestnet">Arc Testnet</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-text-muted">Only Arc Testnet wallets are supported</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-text-muted uppercase tracking-wider">Wallet Address *</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="font-mono text-xs"
                required
                pattern="^0x[0-9a-fA-F]{40}$"
                title="Must be a valid Ethereum address (0x followed by 40 hex characters)"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-text-muted uppercase tracking-wider">Label (optional)</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="My treasury wallet"
              />
            </div>

            <Button type="submit" disabled={adding} className="w-full">
              {adding ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Adding wallet...</>
              ) : (
                <><Plus className="h-4 w-4" /> Link Wallet</>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
