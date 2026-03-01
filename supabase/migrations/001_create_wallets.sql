CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circle_wallet_id TEXT NOT NULL UNIQUE,
  wallet_set_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  address TEXT,
  blockchain TEXT,
  type TEXT,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.wallets IS 'Circle developer-controlled wallets per user (SCA and gateway_signer types).';
COMMENT ON COLUMN public.wallets.type IS 'sca = Smart Contract Account; gateway_signer = EOA for signing burn intents';

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own wallets"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallets"
  ON public.wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets"
  ON public.wallets FOR UPDATE
  USING (auth.uid() = user_id);
