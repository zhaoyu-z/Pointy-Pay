import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server-client";
import { getOrCreateGatewayEOAWallet } from "@/lib/circle/create-gateway-eoa-wallets";
import { executeBridgeKitTransfer } from "@/lib/circle/bridge-kit";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipient_address, amount, destination_chain = "arcTestnet", from_wallet } = body;

    if (!recipient_address || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "recipient_address and a positive amount are required" },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Get signing EOA wallet
    const { walletId, address: gatewayAddress } = await getOrCreateGatewayEOAWallet(
      user.id,
      "ARC-TESTNET"
    );

    // Execute via Circle Gateway (same infrastructure as Nanopayments)
    const { txHash } = await executeBridgeKitTransfer(
      walletId,
      "arcTestnet",
      destination_chain,
      String(amount),
      recipient_address
    );

    // Record in transaction history — gateway_wallet_address stores the user's chosen source wallet
    await serviceClient.from("transaction_history").insert({
      user_id: user.id,
      chain: "arcTestnet",
      tx_type: "nano_send",
      amount,
      tx_hash: txHash,
      gateway_wallet_address: from_wallet ?? gatewayAddress,
      destination_chain,
      recipient_address,
      status: "confirmed",
    });

    return NextResponse.json({ txHash, amount, destination_chain });
  } catch (err: any) {
    console.error("[nano/send] POST error:", err);
    return NextResponse.json({ error: err.message ?? "Nano send failed" }, { status: 500 });
  }
}
