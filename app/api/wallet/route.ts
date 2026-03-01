import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdcBalance } from "@/lib/circle/gateway-sdk";
import type { Address } from "viem";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "sca")
      .single();

    if (!wallet) {
      return NextResponse.json({ wallet: null });
    }

    // Fetch on-chain USDC balance
    let usdcBalance = 0;
    try {
      const raw = await getUsdcBalance(wallet.wallet_address as Address, "arcTestnet");
      usdcBalance = Number(raw) / 1_000_000;
    } catch {
      // Balance fetch failure is non-fatal
    }

    return NextResponse.json({ wallet: { ...wallet, usdc_balance: usdcBalance } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
