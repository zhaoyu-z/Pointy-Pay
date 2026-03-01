import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: campaign, error } = await supabase
      .from("payout_campaigns")
      .update({ status: "approved" })
      .eq("id", id)
      .eq("user_id", user.id)
      .in("status", ["draft", "scheduled"])
      .select(`*, payout_entries(*)`)
      .single();

    if (error || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found or cannot be approved" },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
