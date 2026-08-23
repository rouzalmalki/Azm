import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";

/**
 * admin-auth — يتحقق من كلمة مرور لوحة التحكم ويعيد Admin Token.
 * الغرض: منع كشف ADMIN_API_TOKEN في bundle الواجهة الأمامية.
 * يقبل: POST { password: string }
 * يعيد: { token: string } أو { error: string }
 */

// Rate-limit بسيط: أقصى 10 محاولات فاشلة في الدقيقة لكل IP
const failMap = new Map<string, { count: number; resetAt: number }>();

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

  // ── Rate limiting ──────────────────────────────────────────────────────
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const now = Date.now();
  const entry = failMap.get(clientIp);
  if (entry) {
    if (now < entry.resetAt && entry.count >= 10) {
      return new Response(
        JSON.stringify({ error: "تجاوزت الحد المسموح به. انتظر دقيقة وأعد المحاولة." }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 429 }
      );
    }
    if (now >= entry.resetAt) failMap.delete(clientIp);
  }

  // ── Parse body ────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "طلب غير صالح" }),
      { headers: { ...corsH, "Content-Type": "application/json" }, status: 400 }
    );
  }

  const password = String(body.password ?? "").trim();
  if (!password) {
    return new Response(
      JSON.stringify({ error: "كلمة المرور مطلوبة" }),
      { headers: { ...corsH, "Content-Type": "application/json" }, status: 400 }
    );
  }

  const adminToken = Deno.env.get("ADMIN_API_TOKEN") ?? "";

  // ── Fallback للاختبار المحلي فقط ──────────────────────────────────────
  // تُستخدم هذه القيمة إذا لم يُضبط ADMIN_API_TOKEN في Supabase Secrets.
  // يجب إضافة ADMIN_API_TOKEN الحقيقي في OnSpace Cloud قبل النشر في الإنتاج.
  const FALLBACK_PASSWORD = "azm@admin2026";
  const effectiveToken = adminToken || FALLBACK_PASSWORD;

  if (!adminToken) {
    console.warn(
      "[admin-auth] WARNING: ADMIN_API_TOKEN not set in Secrets — " +
      "using fallback password for testing only. " +
      "Add ADMIN_API_TOKEN in OnSpace Cloud Secrets before going live."
    );
  }

  // ── التحقق من كلمة المرور ───────────────────────────────────────────
  if (password !== effectiveToken) {
    // تسجيل المحاولة الفاشلة
    const curr = failMap.get(clientIp) ?? { count: 0, resetAt: now + 60_000 };
    curr.count += 1;
    if (curr.count === 1) curr.resetAt = now + 60_000;
    failMap.set(clientIp, curr);

    console.warn("[admin-auth] failed attempt from", clientIp);
    return new Response(
      JSON.stringify({ error: "كلمة المرور غير صحيحة" }),
      { headers: { ...corsH, "Content-Type": "application/json" }, status: 401 }
    );
  }

  // إعادة تعيين عداد الفشل عند النجاح
  failMap.delete(clientIp);
  console.log("[admin-auth] successful login from", clientIp);

  return new Response(
    JSON.stringify({ token: effectiveToken }),
    { headers: { ...corsH, "Content-Type": "application/json" }, status: 200 }
  );
});
