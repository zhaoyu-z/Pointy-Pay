import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for privileged server-side writes (bypasses RLS)
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}
