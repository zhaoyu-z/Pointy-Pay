import { NextResponse } from "next/server";
import { circleDeveloperSdk } from "@/lib/circle/sdk";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if wallet set already exists for this user
    const { data: existing } = await supabase
      .from("wallets")
      .select("id, circle_wallet_id, wallet_set_id, wallet_address")
      .eq("user_id", user.id)
      .eq("type", "sca")
      .single();

    if (existing) {
      return NextResponse.json({ wallet: existing });
    }

    // Create a new wallet set + SCA wallet
    const walletSetResponse = await circleDeveloperSdk.createWalletSet({
      name: `PointyPay-${user.id.slice(0, 8)}`,
    });

    const walletSetId = walletSetResponse.data?.walletSet?.id;
    if (!walletSetId) throw new Error("Failed to create wallet set");

    const walletResponse = await circleDeveloperSdk.createWallets({
      accountType: "SCA",
      blockchains: ["MATIC-AMOY"],
      count: 1,
      walletSetId,
    });

    const wallet = walletResponse.data?.wallets?.[0];
    if (!wallet) throw new Error("Failed to create wallet");

    // Store in Supabase
    const { data: stored, error: insertError } = await supabase
      .from("wallets")
      .insert({
        user_id: user.id,
        circle_wallet_id: wallet.id,
        wallet_set_id: walletSetId,
        wallet_address: wallet.address,
        address: wallet.address,
        blockchain: wallet.blockchain,
        type: "sca",
        name: "Primary Wallet",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ wallet: stored }, { status: 201 });
  } catch (err: any) {
    console.error("[wallet-set] POST error:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}

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

    return NextResponse.json({ wallet: wallet ?? null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
