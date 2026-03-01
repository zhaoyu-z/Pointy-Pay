import { NextRequest, NextResponse } from "next/server";
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

    const { data: wallets, error } = await supabase
      .from("linked_wallets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Fetch USDC balance for each wallet on Arc Testnet
    const DECIMALS = 1_000_000;
    const walletsWithBalance = await Promise.all(
      (wallets ?? []).map(async (w) => {
        try {
          const raw = await getUsdcBalance(w.wallet_address as Address, "arcTestnet");
          return { ...w, usdc_balance: Number(raw) / DECIMALS };
        } catch {
          return { ...w, usdc_balance: null };
        }
      })
    );

    return NextResponse.json({ wallets: walletsWithBalance });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { wallet_address, label } = body;

    if (!wallet_address || !/^0x[0-9a-fA-F]{40}$/.test(wallet_address)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("linked_wallets")
      .insert({
        user_id: user.id,
        wallet_address: wallet_address.toLowerCase(),
        chain: "arcTestnet",
        label: label?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "This wallet is already linked to your account" }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ wallet: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
