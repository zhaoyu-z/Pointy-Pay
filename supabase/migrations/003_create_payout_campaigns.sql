CREATE TABLE public.payout_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  policy_min_treasury NUMERIC,
  policy_requires_approval BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.payout_campaigns IS 'Payout campaigns (payroll runs, revenue distributions, fund settlements).';
COMMENT ON COLUMN public.payout_campaigns.type IS 'payroll | revenue_distribution | fund_settlement';
COMMENT ON COLUMN public.payout_campaigns.status IS 'draft | scheduled | approved | executing | completed | failed';
COMMENT ON COLUMN public.payout_campaigns.policy_min_treasury IS 'Minimum gateway USDC balance required to execute. NULL = no requirement.';

ALTER TABLE public.payout_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own campaigns"
  ON public.payout_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
  ON public.payout_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON public.payout_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_campaigns_user_id ON public.payout_campaigns(user_id);
CREATE INDEX idx_campaigns_status ON public.payout_campaigns(user_id, status);
CREATE INDEX idx_campaigns_created_at ON public.payout_campaigns(created_at DESC);
