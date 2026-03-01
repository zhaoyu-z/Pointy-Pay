import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server-client";
import { getOrCreateGatewayEOAWallet } from "@/lib/circle/create-gateway-eoa-wallets";
import { executeBridgeKitTransfer } from "@/lib/circle/bridge-kit";
import { getUsdcBalance, GATEWAY_WALLET_ADDRESS } from "@/lib/circle/gateway-sdk";
import type { Address } from "viem";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Read from_wallet from request body (optional)
    let fromWallet: string | undefined;
    try {
      const body = await request.json();
      fromWallet = body?.from_wallet;
    } catch {
      // Body is optional
    }

    // Load campaign with entries
    const { data: campaign, error: fetchError } = await supabase
      .from("payout_campaigns")
      .select(`*, payout_entries(*)`)
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Validate campaign status
    if (!["approved", "draft"].includes(campaign.status)) {
      return NextResponse.json(
        { error: `Campaign cannot be executed in status: ${campaign.status}` },
        { status: 400 }
      );
    }

    // Check minimum treasury balance policy
    if (campaign.policy_min_treasury) {
      const gwBalance = await getUsdcBalance(GATEWAY_WALLET_ADDRESS as Address, "arcTestnet");
      const balanceUsdc = Number(gwBalance) / 1_000_000;
      if (balanceUsdc < campaign.policy_min_treasury) {
        return NextResponse.json(
          {
            error: `Gateway balance ${balanceUsdc.toFixed(2)} USDC is below the policy minimum of ${campaign.policy_min_treasury} USDC`,
          },
          { status: 400 }
        );
      }
    }

    // Get the signing EOA wallet
    const { walletId } = await getOrCreateGatewayEOAWallet(user.id, "ARC-TESTNET");

    // Mark campaign as executing
    await serviceClient
      .from("payout_campaigns")
      .update({ status: "executing" })
      .eq("id", id);

    const pendingEntries = (campaign.payout_entries ?? []).filter(
      (e: any) => e.status === "pending"
    );

    let successCount = 0;
    let failCount = 0;

    for (const entry of pendingEntries) {
      try {
        const { txHash } = await executeBridgeKitTransfer(
          walletId,
          "arcTestnet",
          entry.destination_chain,
          String(entry.amount),
          entry.destination_address
        );

        await serviceClient
          .from("payout_entries")
          .update({ status: "success", tx_hash: txHash })
          .eq("id", entry.id);

        await serviceClient.from("transaction_history").insert({
          user_id: user.id,
          campaign_id: id,
          chain: "arcTestnet",
          tx_type: "cross_chain_payout",
          amount: entry.amount,
          tx_hash: txHash,
          gateway_wallet_address: fromWallet ?? null,
          destination_chain: entry.destination_chain,
          recipient_address: entry.destination_address,
          status: "confirmed",
        });

        successCount++;
      } catch (entryErr: any) {
        const reason = entryErr.message ?? "Unknown error";
        await serviceClient
          .from("payout_entries")
          .update({ status: "failed", error_reason: reason })
          .eq("id", entry.id);
        failCount++;
      }
    }

    const finalStatus = successCount === 0 ? "failed" : "completed";
    await serviceClient
      .from("payout_campaigns")
      .update({ status: finalStatus, executed_at: new Date().toISOString() })
      .eq("id", id);

    const { data: updatedCampaign } = await serviceClient
      .from("payout_campaigns")
      .select(`*, payout_entries(*)`)
      .eq("id", id)
      .single();

    return NextResponse.json({ campaign: updatedCampaign, successCount, failCount });
  } catch (err: any) {
    console.error("[campaigns/execute] POST error:", err);

    try {
      const serviceClient = createServiceClient();
      await serviceClient
        .from("payout_campaigns")
        .update({ status: "failed" })
        .eq("id", id);
    } catch {
      // Best-effort cleanup
    }

    return NextResponse.json({ error: err.message ?? "Execution failed" }, { status: 500 });
  }
}
