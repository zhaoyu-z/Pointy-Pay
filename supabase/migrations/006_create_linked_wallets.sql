-- User-linked external wallets (EOA addresses the user provides themselves)
CREATE TABLE public.linked_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  chain TEXT NOT NULL DEFAULT 'arcTestnet',
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, wallet_address)
);

COMMENT ON TABLE public.linked_wallets IS 'External wallet addresses the user links to their account for balance tracking and payout sourcing.';
COMMENT ON COLUMN public.linked_wallets.chain IS 'arcTestnet (currently the only supported chain for linked wallets)';

ALTER TABLE public.linked_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own linked wallets"
  ON public.linked_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own linked wallets"
  ON public.linked_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own linked wallets"
  ON public.linked_wallets FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_linked_wallets_user_id ON public.linked_wallets(user_id);
