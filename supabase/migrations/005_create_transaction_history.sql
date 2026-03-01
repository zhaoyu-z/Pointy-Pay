CREATE TABLE public.transaction_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.payout_campaigns(id) ON DELETE SET NULL,
  chain TEXT NOT NULL,
  tx_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tx_hash TEXT,
  gateway_wallet_address TEXT,
  destination_chain TEXT,
  recipient_address TEXT,
  status TEXT DEFAULT 'success',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.transaction_history IS 'All on-chain transactions: deposits, payouts, nano sends.';
COMMENT ON COLUMN public.transaction_history.tx_type IS 'deposit | payout | nano_send';
COMMENT ON COLUMN public.transaction_history.status IS 'pending | success | failed';

ALTER TABLE public.transaction_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own transaction history"
  ON public.transaction_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transaction history"
  ON public.transaction_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_tx_history_user_id ON public.transaction_history(user_id, created_at DESC);
CREATE INDEX idx_tx_history_type ON public.transaction_history(user_id, tx_type);
CREATE INDEX idx_tx_history_campaign ON public.transaction_history(campaign_id);
