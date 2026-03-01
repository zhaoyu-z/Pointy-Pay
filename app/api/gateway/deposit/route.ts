import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateGatewayEOAWallet } from "@/lib/circle/create-gateway-eoa-wallets";
import { initiateDepositFromCustodialWallet } from "@/lib/circle/gateway-sdk";
import { createServiceClient } from "@/lib/supabase/server-client";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const amountUsdc: number = typeof body.amount === "number" ? body.amount : 10;
    const amountAtomic = BigInt(Math.round(amountUsdc * 1_000_000));

    // Get or create the Gateway EOA wallet for signing
    const { walletId, address } = await getOrCreateGatewayEOAWallet(user.id, "ARC-TESTNET");

    const txHash = await initiateDepositFromCustodialWallet(walletId, "arcTestnet", amountAtomic);

    // Record in transaction history
    const serviceClient = createServiceClient();
    await serviceClient.from("transaction_history").insert({
      user_id: user.id,
      chain: "arcTestnet",
      tx_type: "gateway_deposit",
      amount: amountUsdc,
      tx_hash: txHash,
      gateway_wallet_address: address,
      status: "confirmed",
    });

    return NextResponse.json({ txHash, amount: amountUsdc, gatewayWalletAddress: address });
  } catch (err: any) {
    console.error("[gateway/deposit] POST error:", err);
    return NextResponse.json({ error: err.message ?? "Deposit failed" }, { status: 500 });
  }
}
