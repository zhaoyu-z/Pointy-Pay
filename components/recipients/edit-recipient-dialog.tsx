"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
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
import { SUPPORTED_CHAINS } from "@/lib/chain-config";
import type { SupportedChain } from "@/lib/chain-config";
import type { Recipient } from "@/types/recipient";
import { toast } from "sonner";

interface EditRecipientDialogProps {
  recipient: Recipient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updated: Recipient) => void;
}

export function EditRecipientDialog({ recipient, open, onOpenChange, onSuccess }: EditRecipientDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [preferredChain, setPreferredChain] = useState<SupportedChain>("arcTestnet");
  const [defaultAmount, setDefaultAmount] = useState("");

  useEffect(() => {
    if (recipient) {
      setName(recipient.name);
      setEmail(recipient.email ?? "");
      setWalletAddress(recipient.wallet_address);
      setPreferredChain(recipient.preferred_chain);
      setDefaultAmount(recipient.default_amount != null ? String(recipient.default_amount) : "");
    }
  }, [recipient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) return;
    if (!name.trim() || !walletAddress.trim()) {
      toast.error("Name and wallet address are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/recipients/${recipient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          wallet_address: walletAddress.trim(),
          preferred_chain: preferredChain,
          default_amount: defaultAmount ? parseFloat(defaultAmount) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update recipient");
      toast.success("Recipient updated");
      onSuccess(data.recipient);
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Failed to update recipient", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        style={{
          background: "rgba(7, 11, 20, 0.97)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Recipient</DialogTitle>
          <DialogDescription>Update the details for {recipient?.name}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-text-muted uppercase tracking-wider">Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alice Chen"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-text-muted uppercase tracking-wider">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-text-muted uppercase tracking-wider">Wallet Address *</Label>
            <Input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="font-mono text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-text-muted uppercase tracking-wider">Preferred Chain</Label>
              <Select value={preferredChain} onValueChange={(v) => setPreferredChain(v as SupportedChain)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CHAINS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-text-muted uppercase tracking-wider">Default Amount (USDC)</Label>
              <Input
                type="number"
                step="0.01"
                value={defaultAmount}
                onChange={(e) => setDefaultAmount(e.target.value)}
                placeholder="500.00"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
