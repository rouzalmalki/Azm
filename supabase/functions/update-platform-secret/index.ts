import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";

/**
 * update-platform-secret
 * محمية بـ Admin-Token مخزّن في Supabase Secrets (ADMIN_API_TOKEN).
 * لا يقبل الطلب إلا إذا أرسل الطالب الـ token الصحيح في header.
 */

const ALLOWED_KEYS = ["MOYASAR_SECRET_KEY", "ADMIN_API_TOKEN"];

serve(async (req) => {
  const corsH = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsH });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { headers: { ...corsH, "Content-Type": "application/json" }, status: 405 }
    );
  }

  // ── التحقق من Admin Token ─────────────────────────────────────────────
  const adminToken = Deno.env.get("ADMIN_API_TOKEN");
  const requestToken = req.headers.get("x-admin-token") ?? "";

  if (!adminToken || !requestToken || requestToken !== adminToken) {
    console.warn("[update-platform-secret] unauthorized attempt");
    return new Response(
      JSON.stringify({ error: "غير مصرح" }),
      { headers: { ...corsH, "Content-Type": "application/json" }, status: 401 }
    );
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "طلب غير صالح" }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const key = String(body.key ?? "").trim();
    const value = body.value !== undefined ? String(body.value).trim() : null;

    if (!key) {
      return new Response(
        JSON.stringify({ error: "الحقل key مطلوب" }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 400 }
      );
    }
    if (value === null || value === undefined) {
      return new Response(
        JSON.stringify({ error: "الحقل value مطلوب" }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 400 }
      );
    }
    if (!ALLOWED_KEYS.includes(key)) {
      return new Response(
        JSON.stringify({ error: `المفتاح "${key}" غير مسموح به` }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 403 }
      );
    }
    // تحقق من طول القيمة
    if (value.length > 500) {
      return new Response(
        JSON.stringify({ error: "قيمة المفتاح طويلة جداً" }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: upsertError } = await supabaseAdmin
      .from("platform_secrets")
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    if (upsertError) {
      console.error("[update-platform-secret] DB error:", upsertError.message);
      return new Response(
        JSON.stringify({ error: "خطأ في قاعدة البيانات" }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("[update-platform-secret] updated key:", key);

    return new Response(
      JSON.stringify({ success: true, key }),
      { headers: { ...corsH, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[update-platform-secret] unhandled:", (error as Error).message);
    return new Response(
      JSON.stringify({ error: "خطأ داخلي في الخادم" }),
      { headers: { ...corsH, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
