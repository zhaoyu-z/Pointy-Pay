import { createClient } from "@/lib/supabase/server";
import { circleDeveloperSdk } from "@/lib/circle/sdk";

export interface GatewayEOAWallet {
  chain: string;
  address: string;
  walletId: string;
  name: string;
}

export async function generateGatewayEOAWallet(walletSetId: string): Promise<GatewayEOAWallet> {
  const response = await circleDeveloperSdk.createWallets({
    walletSetId,
    accountType: "EOA",
    blockchains: ["ARC-TESTNET"],
    count: 1,
  });

  if (!response.data?.wallets?.length) {
    throw new Error("Failed to create Gateway EOA wallet.");
  }

  const wallet = response.data.wallets[0];
  return {
    chain: wallet.blockchain,
    address: wallet.address,
    walletId: wallet.id,
    name: wallet.name || "Gateway Signer (Multichain)",
  };
}

export async function storeGatewayEOAWalletForUser(userId: string, walletSetId: string) {
  const supabase = await createClient();
  const wallet = await generateGatewayEOAWallet(walletSetId);

  const { data, error } = await supabase
    .from("wallets")
    .insert([{
      user_id: userId,
      name: wallet.name,
      address: wallet.address,
      wallet_address: wallet.address,
      blockchain: "MULTICHAIN",
      type: "gateway_signer",
      circle_wallet_id: wallet.walletId,
      wallet_set_id: walletSetId,
    }])
    .select();

  if (error) throw error;
  return data;
}

export async function getGatewayEOAWalletId(
  userId: string,
  _blockchain: string
): Promise<{ walletId: string; address: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("wallets")
    .select("circle_wallet_id, address")
    .eq("user_id", userId)
    .eq("type", "gateway_signer")
    .single();

  if (error || !data) throw new Error(`Gateway EOA wallet not found for user ${userId}`);

  return { walletId: data.circle_wallet_id, address: data.address };
}

export async function getOrCreateGatewayEOAWallet(
  userId: string,
  blockchain: string
): Promise<{ walletId: string; address: string }> {
  try {
    return await getGatewayEOAWalletId(userId, blockchain);
  } catch {
    const supabase = await createClient();
    const { data: scaWallet, error } = await supabase
      .from("wallets")
      .select("wallet_set_id")
      .eq("user_id", userId)
      .eq("type", "sca")
      .limit(1)
      .single();

    if (error || !scaWallet) throw new Error(`No SCA wallet found for user ${userId}.`);

    await storeGatewayEOAWalletForUser(userId, scaWallet.wallet_set_id);
    return await getGatewayEOAWalletId(userId, blockchain);
  }
}
