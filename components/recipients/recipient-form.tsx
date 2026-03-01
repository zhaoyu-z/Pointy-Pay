"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORTED_CHAINS } from "@/lib/chain-config";
import type { SupportedChain } from "@/lib/chain-config";
import type { CreateRecipientPayload } from "@/types/recipient";
import { toast } from "sonner";

interface RecipientFormProps {
  onSuccess: () => void;
}

export function RecipientForm({ onSuccess }: RecipientFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [preferredChain, setPreferredChain] = useState<SupportedChain>("arcTestnet");
  const [defaultAmount, setDefaultAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !walletAddress.trim()) {
      toast.error("Name and wallet address are required");
      return;
    }
    setLoading(true);
    try {
      const payload: CreateRecipientPayload = {
        name: name.trim(),
        email: email.trim() || undefined,
        wallet_address: walletAddress.trim(),
        preferred_chain: preferredChain,
        allocation_type: "fixed",
        default_amount: defaultAmount ? parseFloat(defaultAmount) : undefined,
      };

      const res = await fetch("/api/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add recipient");

      toast.success("Recipient added", { description: `${name} is now in your list.` });
      setName("");
      setEmail("");
      setWalletAddress("");
      setPreferredChain("arcTestnet");
      setDefaultAmount("");
      onSuccess();
    } catch (err: any) {
      toast.error("Failed to add recipient", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Recipient</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alice Chen"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email (optional)</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Wallet Address *</Label>
            <Input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preferred Chain</Label>
              <Select value={preferredChain} onValueChange={(v) => setPreferredChain(v as SupportedChain)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CHAINS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Amount (USDC)</Label>
              <Input
                type="number"
                step="0.01"
                value={defaultAmount}
                onChange={(e) => setDefaultAmount(e.target.value)}
                placeholder="500.00"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Adding...
              </>
            ) : (
              "Add Recipient"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
