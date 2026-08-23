import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Resolves the Moyasar secret key.
 * Priority: platform_secrets DB table → MOYASAR_SECRET_KEY env variable.
 */
export async function getMoyasarKey(): Promise<string | null> {
  // 1. Try DB (updated via admin UI)
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const { data } = await supabaseAdmin
      .from("platform_secrets")
      .select("value")
      .eq("key", "MOYASAR_SECRET_KEY")
      .maybeSingle();

    if (data?.value) return data.value as string;
  } catch (e) {
    console.warn("[getMoyasarKey] DB lookup failed, falling back to env:", (e as Error).message);
  }

  // 2. Fallback: env variable
  return Deno.env.get("MOYASAR_SECRET_KEY") ?? null;
}
