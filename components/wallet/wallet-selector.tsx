"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { truncateAddress, formatUsdcShort } from "@/lib/utils";
import type { LinkedWallet } from "@/lib/hooks/useUserWallets";

interface WalletSelectorProps {
  wallets: LinkedWallet[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

export function WalletSelector({ wallets, value, onChange, label = "From Wallet", disabled }: WalletSelectorProps) {
  if (wallets.length === 0) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-text-muted uppercase tracking-wider">{label}</Label>
        <div
          className="flex h-9 w-full items-center rounded-lg px-3 text-sm text-text-muted"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          No wallets linked — add one in the header
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-text-muted uppercase tracking-wider">{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Select source wallet" />
        </SelectTrigger>
        <SelectContent>
          {wallets.map((w) => (
            <SelectItem key={w.id} value={w.wallet_address}>
              <div className="flex flex-col">
                <span className="font-mono text-xs">
                  {w.label ? `${w.label} · ` : ""}{truncateAddress(w.wallet_address, 6)}
                </span>
                {w.usdc_balance !== null && (
                  <span className="text-[10px] text-primary">{formatUsdcShort(w.usdc_balance)} USDC</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
