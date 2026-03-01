import type { SupportedChain } from "@/lib/chain-config";

export type AllocationType = "fixed" | "percentage";

export interface Recipient {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  wallet_address: string;
  preferred_chain: SupportedChain;
  allocation_type: AllocationType;
  default_amount: number | null;
  tags: string[] | null;
  created_at: string;
}

export interface CreateRecipientPayload {
  name: string;
  email?: string;
  wallet_address: string;
  preferred_chain: SupportedChain;
  allocation_type: AllocationType;
  default_amount?: number;
  tags?: string[];
}
