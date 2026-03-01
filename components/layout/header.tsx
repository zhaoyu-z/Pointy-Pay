"use client";

import { useState } from "react";
import { Plus, Wallet, Copy, Check } from "lucide-react";
import { truncateAddress, formatUsdcShort } from "@/lib/utils";
import { toast } from "sonner";
import { useUserWallets } from "@/lib/hooks/useUserWallets";
import { AddWalletModal } from "@/components/wallet/add-wallet-modal";

export function Header() {
  const { wallets, loading, addWallet, removeWallet, totalBalance } = useUserWallets();
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasWallets = wallets.length > 0;
  const primaryWallet = wallets[0];

  const handleCopy = async () => {
    if (!primaryWallet) return;
    await navigator.clipboard.writeText(primaryWallet.wallet_address);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header
        className="sticky top-0 z-30 h-16 w-full shrink-0 flex items-center justify-end px-6 gap-3"
        style={{
          background: "rgba(7, 11, 20, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Add wallet button */}
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-text-muted transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.08)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(16,185,129,0.25)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.09)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
          }}
          title="Add a new wallet"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add wallet</span>
        </button>

        {/* Wallet summary pill */}
        {!loading && !hasWallets ? (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all duration-200"
            style={{
              background: "rgba(251,191,36,0.07)",
              border: "1px solid rgba(251,191,36,0.2)",
              color: "var(--warning)",
            }}
          >
            <Wallet className="h-3.5 w-3.5" />
            No wallet linked
          </button>
        ) : hasWallets ? (
          <div className="flex items-center gap-2">
            {/* Total balance + wallet count */}
            <div
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 transition-all duration-200"
              style={{
                background: "rgba(16, 185, 129, 0.06)",
                border: "1px solid rgba(16, 185, 129, 0.18)",
              }}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span
                  className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
                  style={{ animation: "status-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite" }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>

              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  {wallets.length} wallet{wallets.length > 1 ? "s" : ""}
                  {" · "}
                  <span className="text-primary font-mono">{formatUsdcShort(totalBalance)} USDC</span>
                </span>
                {primaryWallet && (
                  <span className="font-mono text-xs text-text-primary hidden sm:block mt-0.5">
                    {truncateAddress(primaryWallet.wallet_address, 6)}
                    {wallets.length > 1 && (
                      <span className="text-text-muted"> +{wallets.length - 1}</span>
                    )}
                  </span>
                )}
              </div>

              {/* Copy primary wallet */}
              {primaryWallet && (
                <button
                  onClick={handleCopy}
                  className="text-text-muted hover:text-primary transition-colors"
                  title="Copy primary wallet address"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>

            {/* Manage button */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-center h-9 w-9 rounded-xl text-text-muted transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
              }}
              title="Manage wallets"
            >
              <Wallet className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </header>

      <AddWalletModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        wallets={wallets}
        onAdd={addWallet}
        onRemove={removeWallet}
      />
    </>
  );
}
