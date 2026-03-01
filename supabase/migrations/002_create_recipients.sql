CREATE TABLE public.recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  wallet_address TEXT NOT NULL,
  preferred_chain TEXT NOT NULL DEFAULT 'arcTestnet',
  allocation_type TEXT NOT NULL DEFAULT 'fixed',
  default_amount NUMERIC,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.recipients IS 'Payout recipients (employees, contractors, stakeholders).';
COMMENT ON COLUMN public.recipients.allocation_type IS 'fixed = fixed USDC amount; percentage = % of campaign total';
COMMENT ON COLUMN public.recipients.preferred_chain IS 'arcTestnet | baseSepolia | avalancheFuji';

ALTER TABLE public.recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own recipients"
  ON public.recipients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipients"
  ON public.recipients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipients"
  ON public.recipients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipients"
  ON public.recipients FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_recipients_user_id ON public.recipients(user_id);
