import { randomBytes } from "crypto";
import {
  http,
  maxUint256,
  zeroAddress,
  pad,
  createPublicClient,
  erc20Abi,
  type Address,
  type Hash,
  type Chain,
} from "viem";
import * as chains from "viem/chains";
import { circleDeveloperSdk } from "@/lib/circle/sdk";

export const GATEWAY_WALLET_ADDRESS = "0x0077777d7EBA4688BDeF3E311b846F25870A19B9";
export const GATEWAY_MINTER_ADDRESS = "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B";

const arcRpcKey = process.env.ARC_TESTNET_RPC_KEY || "c0ca2582063a5bbd5db2f98c139775e982b16919";

export const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: [`https://rpc.testnet.arc.network/${arcRpcKey}`] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
} as const satisfies Chain;

export const USDC_ADDRESSES = {
  arcTestnet: "0x3600000000000000000000000000000000000000",
  avalancheFuji: "0x5425890298aed601595a70ab815c96711a31bc65",
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
} as const;

export const TOKEN_IDS = {
  arcTestnet: "15dc2b5d-0994-58b0-bf8c-3a0501148ee8",
} as const;

export const DOMAIN_IDS = {
  avalancheFuji: 1,
  baseSepolia: 6,
  arcTestnet: 26,
} as const;

export type SupportedChain = keyof typeof USDC_ADDRESSES;

export const CIRCLE_CHAIN_NAMES: Record<SupportedChain, string> = {
  avalancheFuji: "AVAX-FUJI",
  baseSepolia: "BASE-SEPOLIA",
  arcTestnet: "ARC-TESTNET",
};

export function getChainConfig(chain: SupportedChain): Chain {
  switch (chain) {
    case "arcTestnet":
      return arcTestnet;
    case "avalancheFuji":
      return chains.avalancheFuji;
    case "baseSepolia":
      return chains.baseSepolia;
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
}

const gatewayWalletAbi = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "token", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addDelegate",
    inputs: [
      { name: "token", type: "address" },
      { name: "delegate", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "availableBalance",
    inputs: [
      { name: "depositor", type: "address" },
      { name: "token", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export const gatewayMinterAbi = [
  {
    type: "function",
    name: "gatewayMint",
    inputs: [
      { name: "attestationPayload", type: "bytes" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
] as const;

const TransferSpec = [
  { name: "version", type: "uint32" },
  { name: "sourceDomain", type: "uint32" },
  { name: "destinationDomain", type: "uint32" },
  { name: "sourceContract", type: "bytes32" },
  { name: "destinationContract", type: "bytes32" },
  { name: "sourceToken", type: "bytes32" },
  { name: "destinationToken", type: "bytes32" },
  { name: "sourceDepositor", type: "bytes32" },
  { name: "destinationRecipient", type: "bytes32" },
  { name: "sourceSigner", type: "bytes32" },
  { name: "destinationCaller", type: "bytes32" },
  { name: "value", type: "uint256" },
  { name: "salt", type: "bytes32" },
  { name: "hookData", type: "bytes" },
] as const;

const BurnIntent = [
  { name: "maxBlockHeight", type: "uint256" },
  { name: "maxFee", type: "uint256" },
  { name: "spec", type: "TransferSpec" },
] as const;

function addressToBytes32(address: Address): `0x${string}` {
  return pad(address.toLowerCase() as Address, { size: 32 });
}

export interface BurnIntentSpec {
  version: number;
  sourceDomain: number;
  destinationDomain: number;
  sourceContract: Address;
  destinationContract: Address;
  sourceToken: Address;
  destinationToken: Address;
  sourceDepositor: Address;
  destinationRecipient: Address;
  sourceSigner: Address;
  destinationCaller: Address;
  value: bigint;
  salt: `0x${string}`;
  hookData: `0x${string}`;
}

export interface BurnIntentData {
  maxBlockHeight: bigint;
  maxFee: bigint;
  spec: BurnIntentSpec;
}

export function burnIntentTypedData(burnIntent: BurnIntentData) {
  return {
    types: { EIP712Domain, TransferSpec, BurnIntent },
    domain: { name: "GatewayWallet", version: "1" },
    primaryType: "BurnIntent" as const,
    message: {
      ...burnIntent,
      spec: {
        ...burnIntent.spec,
        sourceContract: addressToBytes32(burnIntent.spec.sourceContract),
        destinationContract: addressToBytes32(burnIntent.spec.destinationContract),
        sourceToken: addressToBytes32(burnIntent.spec.sourceToken),
        destinationToken: addressToBytes32(burnIntent.spec.destinationToken),
        sourceDepositor: addressToBytes32(burnIntent.spec.sourceDepositor),
        destinationRecipient: addressToBytes32(burnIntent.spec.destinationRecipient),
        sourceSigner: addressToBytes32(burnIntent.spec.sourceSigner),
        destinationCaller: addressToBytes32(burnIntent.spec.destinationCaller),
      },
    },
  };
}

async function waitForTransactionConfirmation(challengeId: string): Promise<string> {
  while (true) {
    const response = await circleDeveloperSdk.getTransaction({ id: challengeId });
    const tx = response.data?.transaction;

    if (tx?.state === "CONFIRMED" || tx?.state === "COMPLETE") {
      if (!tx.txHash) throw new Error(`Transaction ${challengeId} confirmed but txHash missing.`);
      return tx.txHash;
    } else if (tx?.state === "FAILED") {
      throw new Error(`Transaction ${challengeId} failed: ${tx.errorReason}`);
    }

    await new Promise((r) => setTimeout(r, 2000));
  }
}

async function initiateContractInteraction(
  walletId: string,
  contractAddress: Address,
  abiFunctionSignature: string,
  args: unknown[]
): Promise<string> {
  const response = await circleDeveloperSdk.createContractExecutionTransaction({
    walletId,
    contractAddress,
    abiFunctionSignature,
    abiParameters: args,
    fee: { type: "level", config: { feeLevel: "HIGH" } },
  });

  const responseData = response.data as unknown as { id?: string };
  if (!responseData?.id) throw new Error("Circle API did not return a challenge ID.");
  return responseData.id;
}

export async function initiateDepositFromCustodialWallet(
  walletId: string,
  chain: SupportedChain,
  amountInAtomicUnits: bigint,
  delegateAddress?: Address
): Promise<string> {
  const usdcAddress = USDC_ADDRESSES[chain];
  let lastTxHash: string | undefined;

  if (delegateAddress) {
    const id = await initiateContractInteraction(
      walletId, GATEWAY_WALLET_ADDRESS as Address,
      "addDelegate(address,address)", [usdcAddress, delegateAddress]
    );
    lastTxHash = await waitForTransactionConfirmation(id);
  }

  if (amountInAtomicUnits > BigInt(0)) {
    const approveId = await initiateContractInteraction(
      walletId, usdcAddress as Address,
      "approve(address,uint256)", [GATEWAY_WALLET_ADDRESS, amountInAtomicUnits.toString()]
    );
    await waitForTransactionConfirmation(approveId);

    const depositId = await initiateContractInteraction(
      walletId, GATEWAY_WALLET_ADDRESS as Address,
      "deposit(address,uint256)", [usdcAddress, amountInAtomicUnits.toString()]
    );
    return await waitForTransactionConfirmation(depositId);
  }

  if (lastTxHash) return lastTxHash;
  throw new Error("No deposit amount and no delegate provided.");
}

export async function executeMintCircle(
  walletIdOrUserId: string,
  destinationChain: SupportedChain,
  attestation: string,
  signature: string,
  isUserId = false
): Promise<{ txHash: string }> {
  let walletId = walletIdOrUserId;

  if (isUserId) {
    const { getGatewayEOAWalletId } = await import("@/lib/circle/create-gateway-eoa-wallets");
    const result = await getGatewayEOAWalletId(walletIdOrUserId, CIRCLE_CHAIN_NAMES[destinationChain]);
    walletId = result.walletId;
  }

  const response = await circleDeveloperSdk.createContractExecutionTransaction({
    walletId,
    contractAddress: GATEWAY_MINTER_ADDRESS,
    abiFunctionSignature: "gatewayMint(bytes,bytes)",
    abiParameters: [attestation, signature],
    fee: { type: "level", config: { feeLevel: "MEDIUM" } },
  });

  const challengeId = (response.data as unknown as { id?: string })?.id;
  if (!challengeId) throw new Error("Failed to initiate mint challenge.");

  const txHash = await waitForTransactionConfirmation(challengeId);
  return { txHash };
}

async function signBurnIntentWithEOA(
  burnIntentData: BurnIntentData,
  userId: string
): Promise<`0x${string}`> {
  const { getGatewayEOAWalletId } = await import("@/lib/circle/create-gateway-eoa-wallets");
  const { walletId } = await getGatewayEOAWalletId(userId, "ARC-TESTNET");

  const typedData = burnIntentTypedData(burnIntentData);

  const serializeBigInt = (obj: unknown): unknown => {
    if (typeof obj === "bigint") return obj.toString();
    if (Array.isArray(obj)) return obj.map(serializeBigInt);
    if (obj && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, serializeBigInt(v)])
      );
    }
    return obj;
  };

  const response = await circleDeveloperSdk.signTypedData({
    walletId,
    data: JSON.stringify(serializeBigInt(typedData)),
  });

  if (!response.data?.signature) throw new Error("Failed to sign burn intent.");
  return response.data.signature as `0x${string}`;
}

export async function submitBurnIntent(
  burnIntent: BurnIntentData["spec"] & { maxBlockHeight: bigint; maxFee: bigint },
  signature: `0x${string}`
) {
  const payload = [
    {
      burnIntent: {
        maxBlockHeight: burnIntent.maxBlockHeight?.toString(),
        maxFee: burnIntent.maxFee?.toString(),
        spec: {
          ...burnIntent,
          value: burnIntent.value?.toString(),
        },
      },
      signature,
    },
  ];

  const response = await fetch("https://gateway-api-testnet.circle.com/v1/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gateway API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const result = Array.isArray(data) ? data[0] : data;
  return {
    attestation: result.attestation as `0x${string}`,
    attestationSignature: result.signature as `0x${string}`,
    transferId: result.transferId as string,
  };
}

export function buildBurnIntentData(
  amount: bigint,
  sourceChain: SupportedChain,
  destChain: SupportedChain,
  signerAddress: Address,
  depositorAddress: Address,
  recipientAddress: Address
): BurnIntentData {
  return {
    maxBlockHeight: maxUint256,
    maxFee: BigInt(2_010_000),
    spec: {
      version: 1,
      sourceDomain: DOMAIN_IDS[sourceChain],
      destinationDomain: DOMAIN_IDS[destChain],
      sourceContract: GATEWAY_WALLET_ADDRESS as Address,
      destinationContract: GATEWAY_MINTER_ADDRESS as Address,
      sourceToken: USDC_ADDRESSES[sourceChain] as Address,
      destinationToken: USDC_ADDRESSES[destChain] as Address,
      sourceDepositor: depositorAddress,
      destinationRecipient: recipientAddress,
      sourceSigner: signerAddress,
      destinationCaller: zeroAddress,
      value: amount,
      salt: `0x${randomBytes(32).toString("hex")}` as `0x${string}`,
      hookData: "0x" as `0x${string}`,
    },
  };
}

export async function transferGatewayBalanceWithEOA(
  userId: string,
  amount: bigint,
  sourceChain: SupportedChain,
  destinationChain: SupportedChain,
  recipientAddress: Address,
  depositorAddress: Address
): Promise<{ transferId: string; attestation: `0x${string}`; attestationSignature: `0x${string}` }> {
  const { getGatewayEOAWalletId } = await import("@/lib/circle/create-gateway-eoa-wallets");
  const { address } = await getGatewayEOAWalletId(userId, "ARC-TESTNET");
  const eoaSignerAddress = address as Address;

  const burnIntentData: BurnIntentData = {
    maxBlockHeight: maxUint256,
    maxFee: BigInt(2_010_000),
    spec: {
      version: 1,
      sourceDomain: DOMAIN_IDS[sourceChain],
      destinationDomain: DOMAIN_IDS[destinationChain],
      sourceContract: GATEWAY_WALLET_ADDRESS as Address,
      destinationContract: GATEWAY_MINTER_ADDRESS as Address,
      sourceToken: USDC_ADDRESSES[sourceChain] as Address,
      destinationToken: USDC_ADDRESSES[destinationChain] as Address,
      sourceDepositor: depositorAddress,
      destinationRecipient: recipientAddress,
      sourceSigner: eoaSignerAddress,
      destinationCaller: zeroAddress,
      value: amount,
      salt: `0x${randomBytes(32).toString("hex")}` as `0x${string}`,
      hookData: "0x" as `0x${string}`,
    },
  };

  const signature = await signBurnIntentWithEOA(burnIntentData, userId);
  const typedData = burnIntentTypedData(burnIntentData);

  const { attestation, attestationSignature, transferId } = await submitBurnIntent(
    { ...typedData.message.spec, maxBlockHeight: burnIntentData.maxBlockHeight, maxFee: burnIntentData.maxFee },
    signature
  );

  let finalAttestation = attestation;
  let finalSignature = attestationSignature;

  if (!finalAttestation || !finalSignature) {
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 3000));
      const poll = await fetch(`https://gateway-api-testnet.circle.com/v1/transfers/${transferId}`);
      const pollJson = await poll.json();

      if (pollJson.attestation && pollJson.signature) {
        finalAttestation = pollJson.attestation;
        finalSignature = pollJson.signature;
        break;
      } else if (pollJson.status === "FAILED") {
        throw new Error(`Transfer failed: ${JSON.stringify(pollJson)}`);
      }
      attempts++;
    }

    if (!finalAttestation || !finalSignature) {
      throw new Error(`Attestation not received after ${maxAttempts} attempts. Transfer ID: ${transferId}`);
    }
  }

  return { transferId, attestation: finalAttestation, attestationSignature: finalSignature };
}

export async function fetchGatewayBalance(address: Address) {
  const sources = [
    { domain: DOMAIN_IDS.arcTestnet, depositor: address },
    { domain: DOMAIN_IDS.avalancheFuji, depositor: address },
    { domain: DOMAIN_IDS.baseSepolia, depositor: address },
  ];

  const response = await fetch("https://gateway-api-testnet.circle.com/v1/balances", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: "USDC", sources }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gateway API error: ${response.status} - ${err}`);
  }

  return await response.json();
}

export async function getUsdcBalance(address: Address, chain: SupportedChain): Promise<bigint> {
  const publicClient = createPublicClient({
    chain: getChainConfig(chain),
    transport: http(),
  });

  const balance = await publicClient.readContract({
    address: USDC_ADDRESSES[chain] as Address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  });

  return balance as bigint;
}

export async function checkWalletGasBalance(
  walletId: string,
  chain: SupportedChain
): Promise<{ hasGas: boolean; address: string; balance: string }> {
  const walletResponse = await circleDeveloperSdk.getWallet({ id: walletId });
  const walletAddress = walletResponse.data?.wallet?.address as Address;

  if (!walletAddress) throw new Error(`Could not fetch address for wallet ID: ${walletId}`);

  if (chain === "arcTestnet") {
    return { hasGas: true, address: walletAddress, balance: "native-usdc" };
  }

  const publicClient = createPublicClient({ chain: getChainConfig(chain), transport: http() });
  const balance = await publicClient.getBalance({ address: walletAddress });

  return { hasGas: balance > BigInt(0), address: walletAddress, balance: balance.toString() };
}

export async function getCircleWalletAddress(walletId: string): Promise<Address> {
  const response = await circleDeveloperSdk.getWallet({ id: walletId });
  if (!response.data?.wallet?.address) throw new Error(`Could not fetch address for wallet: ${walletId}`);
  return response.data.wallet.address as Address;
}
