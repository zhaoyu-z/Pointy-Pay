import { createWalletClient, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  GATEWAY_MINTER_ADDRESS,
  buildBurnIntentData,
  burnIntentTypedData,
  submitBurnIntent,
  gatewayMinterAbi,
  getChainConfig,
  type SupportedChain,
} from "@/lib/circle/gateway-sdk";

export const PRIVATE_KEY_EXECUTOR_ID = "private-key-executor";

export function hasPrivateKeyExecutor(): boolean {
  return !!process.env.PAYOUT_EXECUTOR_PRIVATE_KEY;
}

export function getExecutorAccount() {
  const raw = process.env.PAYOUT_EXECUTOR_PRIVATE_KEY!;
  const key = (raw.startsWith("0x") ? raw : `0x${raw}`) as `0x${string}`;
  return privateKeyToAccount(key);
}

export function getExecutorAddress(): Address {
  return getExecutorAccount().address;
}

export async function executeWithPrivateKey(
  fromChain: SupportedChain,
  toChain: SupportedChain,
  amountUsdc: string,
  recipientAddress: string
): Promise<{ txHash: string }> {
  const account = getExecutorAccount();
  const amountAtomic = BigInt(Math.floor(parseFloat(amountUsdc) * 1_000_000));

  // Build burn intent — executor is both depositor and signer
  const burnIntent = buildBurnIntentData(
    amountAtomic,
    fromChain,
    toChain,
    account.address,
    account.address,
    recipientAddress as Address
  );

  // Get EIP-712 typed data
  const typedData = burnIntentTypedData(burnIntent);

  // Sign with private key using viem (excludes EIP712Domain from types, uses raw bigints)
  const signature = await account.signTypedData({
    domain: typedData.domain,
    types: {
      TransferSpec: typedData.types.TransferSpec,
      BurnIntent: typedData.types.BurnIntent,
    },
    primaryType: "BurnIntent",
    message: typedData.message,
  });

  // Submit to Arc Gateway API
  const { attestation, attestationSignature, transferId } = await submitBurnIntent(
    {
      ...typedData.message.spec,
      maxBlockHeight: burnIntent.maxBlockHeight,
      maxFee: burnIntent.maxFee,
    },
    signature
  );

  let finalAttestation = attestation;
  let finalSignature = attestationSignature;

  // Poll for attestation if not immediately returned
  if (!finalAttestation || !finalSignature) {
    const MAX_ATTEMPTS = 60;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));
      const poll = await fetch(
        `https://gateway-api-testnet.circle.com/v1/transfers/${transferId}`
      );
      const pollJson = await poll.json();

      if (pollJson.attestation && pollJson.signature) {
        finalAttestation = pollJson.attestation;
        finalSignature = pollJson.signature;
        break;
      } else if (pollJson.status === "FAILED") {
        throw new Error(`Gateway transfer failed: ${JSON.stringify(pollJson)}`);
      }
    }

    if (!finalAttestation || !finalSignature) {
      throw new Error(
        `Attestation not received after 60 attempts. Transfer ID: ${transferId}`
      );
    }
  }

  // Execute mint on destination chain using viem walletClient
  const destChain = getChainConfig(toChain);
  const walletClient = createWalletClient({
    account,
    chain: destChain,
    transport: http(),
  });

  const txHash = await walletClient.writeContract({
    address: GATEWAY_MINTER_ADDRESS as Address,
    abi: gatewayMinterAbi,
    functionName: "gatewayMint",
    args: [finalAttestation as `0x${string}`, finalSignature as `0x${string}`],
  });

  return { txHash };
}
