import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CreateCampaignPayload } from "@/types/campaign";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: campaigns, error } = await supabase
      .from("payout_campaigns")
      .select(`
        *,
        payout_entries(id, status, amount)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Compute entry_count and per-status counts
    const enriched = (campaigns ?? []).map((c: any) => ({
      ...c,
      entry_count: c.payout_entries?.length ?? 0,
    }));

    return NextResponse.json({ campaigns: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateCampaignPayload = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
    }
    if (!body.entries?.length) {
      return NextResponse.json({ error: "At least one payout entry is required" }, { status: 400 });
    }

    const totalAmount = body.entries.reduce((sum, e) => sum + (e.amount ?? 0), 0);

    // Determine initial status
    const status = body.scheduled_at ? "scheduled" : "draft";

    const { data: campaign, error: campaignError } = await supabase
      .from("payout_campaigns")
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        type: body.type ?? "payroll",
        description: body.description?.trim() ?? null,
        total_amount: totalAmount,
        status,
        scheduled_at: body.scheduled_at ?? null,
        policy_min_treasury: body.policy_min_treasury ?? null,
        policy_requires_approval: body.policy_requires_approval ?? true,
      })
      .select()
      .single();

    if (campaignError) throw campaignError;

    // Insert payout entries
    const entryRows = body.entries.map((e) => ({
      campaign_id: campaign.id,
      recipient_id: e.recipient_id ?? null,
      recipient_name: e.recipient_name,
      amount: e.amount,
      destination_chain: e.destination_chain ?? "arcTestnet",
      destination_address: e.destination_address,
      status: "pending",
    }));

    const { error: entriesError } = await supabase.from("payout_entries").insert(entryRows);
    if (entriesError) throw entriesError;

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (err: any) {
    console.error("[campaigns] POST error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to create campaign" }, { status: 500 });
  }
}
