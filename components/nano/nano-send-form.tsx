"use client";

import { useState, useEffect } from "react";
import { Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORTED_CHAINS } from "@/lib/chain-config";
import { StreamingAnimation } from "./streaming-animation";
import { WalletSelector } from "@/components/wallet/wallet-selector";
import { useUserWallets } from "@/lib/hooks/useUserWallets";
import { toast } from "sonner";

interface NanoSendResult {
  txHash?: string;
  gatewayTxHash?: string;
  amount: number;
  destinationChain: string;
  recipientAddress: string;
}

export function NanoSendForm() {
  const { wallets } = useUserWallets();
  const [fromWallet, setFromWallet] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState("");
  const [destinationChain, setDestinationChain] = useState("arcTestnet");

  // Pre-select first wallet
  useEffect(() => {
    if (wallets.length > 0 && !fromWallet) {
      setFromWallet(wallets[0].wallet_address);
    }
  }, [wallets, fromWallet]);

  const [sending, setSending] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [complete, setComplete] = useState(false);
  const [result, setResult] = useState<NanoSendResult | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!recipientAddress.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please fill in all required fields with valid values");
      return;
    }

    setSending(true);
    setAnimating(true);
    setComplete(false);

    try {
      const res = await fetch("/api/nano/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_address: recipientAddress.trim(),
          amount: parsedAmount,
          destination_chain: destinationChain,
          from_wallet: fromWallet || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nano send failed");

      setResult({
        txHash: data.txHash,
        gatewayTxHash: data.gatewayTxHash,
        amount: parsedAmount,
        destinationChain,
        recipientAddress: recipientAddress.trim(),
      });

      // Wait for animation to complete before showing done
      await new Promise((resolve) => setTimeout(resolve, 4200));
      setComplete(true);
      toast.success("Nanopayment delivered", {
        description: `${parsedAmount} USDC sent to ${recipientName || recipientAddress.slice(0, 8)}`,
      });
    } catch (err: any) {
      setAnimating(false);
      toast.error("Nanopayment failed", { description: err.message });
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setAnimating(false);
    setComplete(false);
    setResult(null);
    setAmount("");
    setRecipientAddress("");
    setRecipientName("");
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Nano Send
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <WalletSelector
              wallets={wallets}
              value={fromWallet}
              onChange={setFromWallet}
              label="From Wallet (Source)"
              disabled={sending}
            />

            <div className="space-y-2">
              <Label>Recipient Name (optional)</Label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Alice"
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label>Recipient Address *</Label>
              <Input
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                className="font-mono"
                required
                disabled={sending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (USDC) *</Label>
                <Input
                  type="number"
                  step="0.000001"
                  min="0.000001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.01"
                  required
                  disabled={sending}
                />
              </div>
              <div className="space-y-2">
                <Label>Destination Chain</Label>
                <Select
                  value={destinationChain}
                  onValueChange={setDestinationChain}
                  disabled={sending}
                >
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
            </div>

            <div className="rounded-lg px-3 py-2.5" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <p className="text-xs text-primary font-medium">
                Powered by Circle Gateway
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Nanopayments use Circle&apos;s unified USDC Gateway for instant cross-chain
                settlement with zero bridging delay.
              </p>
            </div>

            {!animating && (
              <Button type="submit" disabled={sending} className="w-full">
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" /> Send Nanopayment
                  </>
                )}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Streaming animation shown while payment is processing */}
      {animating && result && (
        <StreamingAnimation
          amount={result.amount}
          recipientName={recipientName || result.recipientAddress.slice(0, 8)}
          destinationChain={destinationChain}
          isActive={animating}
          isComplete={complete}
        />
      )}

      {animating && !result && (
        <StreamingAnimation
          amount={parseFloat(amount) || 0}
          recipientName={recipientName || recipientAddress.slice(0, 8) || "Recipient"}
          destinationChain={destinationChain}
          isActive={true}
          isComplete={false}
        />
      )}

      {complete && (
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Send Another Payment
        </Button>
      )}
    </div>
  );
}
