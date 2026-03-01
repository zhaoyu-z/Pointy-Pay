"use client";

import { useState, useEffect, useCallback } from "react";

export interface LinkedWallet {
  id: string;
  user_id: string;
  wallet_address: string;
  chain: string;
  label: string | null;
  usdc_balance: number | null;
  created_at: string;
}

export function useUserWallets() {
  const [wallets, setWallets] = useState<LinkedWallet[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/user-wallets");
      if (res.ok) {
        const data = await res.json();
        setWallets(data.wallets ?? []);
      }
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addWallet = async (wallet_address: string, label?: string): Promise<{ error?: string }> => {
    const res = await fetch("/api/user-wallets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet_address, label }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? "Failed to add wallet" };
    await refresh();
    window.dispatchEvent(new CustomEvent("wallet-linked"));
    return {};
  };

  const removeWallet = async (id: string): Promise<{ error?: string }> => {
    const res = await fetch(`/api/user-wallets/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      return { error: data.error ?? "Failed to remove wallet" };
    }
    setWallets((prev) => prev.filter((w) => w.id !== id));
    return {};
  };

  const totalBalance = wallets.reduce((sum, w) => sum + (w.usdc_balance ?? 0), 0);

  return { wallets, loading, refresh, addWallet, removeWallet, totalBalance };
}
