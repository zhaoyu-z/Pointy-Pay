CREATE TABLE public.payout_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.payout_campaigns(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.recipients(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  destination_chain TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  tx_hash TEXT,
  error_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.payout_entries IS 'Individual payout records per recipient per campaign.';
COMMENT ON COLUMN public.payout_entries.status IS 'pending | executing | success | failed';

ALTER TABLE public.payout_entries ENABLE ROW LEVEL SECURITY;

-- Users can access entries whose campaign belongs to them
CREATE POLICY "Users can read entries of their own campaigns"
  ON public.payout_entries FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM public.payout_campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert entries for their own campaigns"
  ON public.payout_entries FOR INSERT
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM public.payout_campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update entries of their own campaigns"
  ON public.payout_entries FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM public.payout_campaigns WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_entries_campaign_id ON public.payout_entries(campaign_id);
CREATE INDEX idx_entries_status ON public.payout_entries(campaign_id, status);
