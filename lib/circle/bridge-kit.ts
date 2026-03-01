import type { SupportedChain } from "@/lib/circle/gateway-sdk";
import { PRIVATE_KEY_EXECUTOR_ID, executeWithPrivateKey } from "@/lib/circle/private-key-executor";

// Bridge Kit chain name mapping for Circle Wallets adapter
const BRIDGE_KIT_CHAIN_NAMES: Record<SupportedChain, string> = {
  arcTestnet: "ARC-TESTNET",
  baseSepolia: "BASE-SEPOLIA",
  avalancheFuji: "AVAX-FUJI",
};

/**
 * Execute a cross-chain USDC transfer using Circle Bridge Kit
 * with the Circle Wallets (developer-controlled) adapter.
 *
 * Bridge Kit abstracts the Gateway burn/mint process into a single call.
 * Used for campaign payout entries where destination != arcTestnet.
 *
 * When walletId is PRIVATE_KEY_EXECUTOR_ID, the system-level private key
 * is used to sign burn intents and submit transactions directly via viem,
 * bypassing the Circle Developer SDK entirely.
 */
export async function executeBridgeKitTransfer(
  walletId: string,
  fromChain: SupportedChain,
  toChain: SupportedChain,
  amountUsdc: string,
  recipientAddress: string
): Promise<{ txHash: string }> {
  // Use the system private key executor when no Circle-managed wallet is available
  if (walletId === PRIVATE_KEY_EXECUTOR_ID) {
    return executeWithPrivateKey(fromChain, toChain, amountUsdc, recipientAddress);
  }

  let BridgeKit: any;
  let CircleWalletsAdapter: any;

  try {
    const bridgeKitModule = await import("@circle-fin/bridge-kit");
    const adapterModule = await import("@circle-fin/adapter-circle-wallets");
    BridgeKit = bridgeKitModule.BridgeKit ?? bridgeKitModule.default;
    // The package exports createCircleWalletsAdapter (factory) or a class
    CircleWalletsAdapter = adapterModule.createCircleWalletsAdapter ?? (adapterModule as any).CircleWalletsAdapter ?? adapterModule.default;
  } catch {
    // Bridge Kit not installed — fall back to Gateway SDK directly
    console.warn("Bridge Kit not available, falling back to Gateway SDK for cross-chain transfer.");
    return fallbackGatewayTransfer(walletId, fromChain, toChain, amountUsdc, recipientAddress);
  }

  const adapter = new CircleWalletsAdapter({
    apiKey: process.env.CIRCLE_API_KEY!,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
    walletId,
  });

  const kit = new BridgeKit({ adapter });

  const result = await kit.bridge({
    from: {
      adapter,
      chain: BRIDGE_KIT_CHAIN_NAMES[fromChain],
    },
    to: {
      adapter,
      chain: BRIDGE_KIT_CHAIN_NAMES[toChain],
    },
    amount: amountUsdc,
    recipient: recipientAddress,
  });

  return { txHash: result.txHash ?? result.mintTxHash ?? result.hash ?? "pending" };
}

// Fallback: use Gateway SDK directly if Bridge Kit is unavailable
async function fallbackGatewayTransfer(
  walletId: string,
  fromChain: SupportedChain,
  toChain: SupportedChain,
  amountUsdc: string,
  recipientAddress: string
): Promise<{ txHash: string }> {
  const {
    transferGatewayBalanceWithEOA,
    executeMintCircle,
    getCircleWalletAddress,
  } = await import("@/lib/circle/gateway-sdk");
  const { createClient } = await import("@/lib/supabase/server");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated for fallback gateway transfer.");

  const depositorAddress = await getCircleWalletAddress(walletId);
  const amountAtomic = BigInt(Math.floor(parseFloat(amountUsdc) * 1_000_000));

  const { attestation, attestationSignature } = await transferGatewayBalanceWithEOA(
    user.id,
    amountAtomic,
    fromChain,
    toChain,
    recipientAddress as `0x${string}`,
    depositorAddress
  );

  const { txHash } = await executeMintCircle(walletId, toChain, attestation, attestationSignature);
  return { txHash };
}
