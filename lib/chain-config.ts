export type SupportedChain = "arcTestnet" | "baseSepolia" | "avalancheFuji";

export const CHAIN_NAMES: Record<SupportedChain, string> = {
  arcTestnet: "Arc Testnet",
  baseSepolia: "Base Sepolia",
  avalancheFuji: "Avalanche Fuji",
};

export const NATIVE_TOKENS: Record<SupportedChain, string> = {
  arcTestnet: "USDC",
  baseSepolia: "ETH",
  avalancheFuji: "AVAX",
};

export const CHAIN_COLORS: Record<SupportedChain, string> = {
  arcTestnet: "bg-primary/20 text-primary border-primary/30",
  baseSepolia: "bg-secondary/20 text-secondary border-secondary/30",
  avalancheFuji: "bg-accent/20 text-accent border-accent/30",
};

export const SUPPORTED_CHAINS: Array<{ value: SupportedChain; label: string }> = [
  { value: "arcTestnet", label: "Arc Testnet" },
  { value: "baseSepolia", label: "Base Sepolia" },
  { value: "avalancheFuji", label: "Avalanche Fuji" },
];

export const ARC_EXPLORER_URL = "https://testnet.arcscan.app";

export function getTxExplorerUrl(txHash: string, chain: SupportedChain): string {
  switch (chain) {
    case "arcTestnet":
      return `${ARC_EXPLORER_URL}/tx/${txHash}`;
    case "baseSepolia":
      return `https://sepolia.basescan.org/tx/${txHash}`;
    case "avalancheFuji":
      return `https://testnet.snowtrace.io/tx/${txHash}`;
  }
}

export function getAddressExplorerUrl(address: string, chain: SupportedChain): string {
  switch (chain) {
    case "arcTestnet":
      return `${ARC_EXPLORER_URL}/address/${address}`;
    case "baseSepolia":
      return `https://sepolia.basescan.org/address/${address}`;
    case "avalancheFuji":
      return `https://testnet.snowtrace.io/address/${address}`;
  }
}
