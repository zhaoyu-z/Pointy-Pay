import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdcBalance, GATEWAY_WALLET_ADDRESS } from "@/lib/circle/gateway-sdk";
import type { Address } from "viem";

const GW = GATEWAY_WALLET_ADDRESS as Address;

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const DECIMALS = 1_000_000;

    // Fetch user's linked wallets and gateway wallet balances in parallel
    const [arcResult, baseResult, fujiResult, linkedWalletsResult] = await Promise.allSettled([
      getUsdcBalance(GW, "arcTestnet"),
      getUsdcBalance(GW, "baseSepolia"),
      getUsdcBalance(GW, "avalancheFuji"),
      supabase.from("linked_wallets").select("wallet_address").eq("user_id", user.id),
    ]);

    const arc = arcResult.status === "fulfilled" ? Number(arcResult.value) / DECIMALS : 0;
    const base = baseResult.status === "fulfilled" ? Number(baseResult.value) / DECIMALS : 0;
    const fuji = fujiResult.status === "fulfilled" ? Number(fujiResult.value) / DECIMALS : 0;

    // Sum balances of all user-linked wallets on Arc Testnet
    let userWalletBalance = 0;
    let hasLinkedWallets = false;
    if (linkedWalletsResult.status === "fulfilled") {
      const addresses = linkedWalletsResult.value.data ?? [];
      hasLinkedWallets = addresses.length > 0;
      const balances = await Promise.allSettled(
        addresses.map((w) => getUsdcBalance(w.wallet_address as Address, "arcTestnet"))
      );
      userWalletBalance = balances.reduce((sum, r) => {
        return sum + (r.status === "fulfilled" ? Number(r.value) / DECIMALS : 0);
      }, 0);
    }

    return NextResponse.json({
      arcTestnet: arc,
      baseSepolia: base,
      avalancheFuji: fuji,
      total: arc + base + fuji,
      gatewayWalletAddress: GATEWAY_WALLET_ADDRESS,
      userWalletBalance,
      hasLinkedWallets,
    });
  } catch (err: any) {
    console.error("[gateway/balance] GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
