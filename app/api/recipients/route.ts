import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CreateRecipientPayload } from "@/types/recipient";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: recipients, error } = await supabase
      .from("recipients")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ recipients: recipients ?? [] });
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

    const body: CreateRecipientPayload = await request.json();

    if (!body.name?.trim() || !body.wallet_address?.trim()) {
      return NextResponse.json({ error: "name and wallet_address are required" }, { status: 400 });
    }

    const { data: recipient, error } = await supabase
      .from("recipients")
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        email: body.email?.trim() ?? null,
        wallet_address: body.wallet_address.trim(),
        preferred_chain: body.preferred_chain ?? "arcTestnet",
        allocation_type: body.allocation_type ?? "fixed",
        default_amount: body.default_amount ?? null,
        tags: body.tags ?? [],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ recipient }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
