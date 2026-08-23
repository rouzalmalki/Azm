import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { getMoyasarKey } from "../_shared/getMoyasarKey.ts";

// تحقق بسيط من صيغة Moyasar payment ID (أحرف، أرقام، شُرطات فقط)
const PAYMENT_ID_REGEX = /^[a-zA-Z0-9_-]{6,64}$/;

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

    const paymentId = String(body.paymentId ?? body.sessionId ?? "").trim();

    if (!paymentId || !PAYMENT_ID_REGEX.test(paymentId)) {
      return new Response(
        JSON.stringify({ error: "payment_id غير صالح" }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const secretKey = await getMoyasarKey();
    if (!secretKey) {
      return new Response(
        JSON.stringify({ error: "MOYASAR_SECRET_KEY غير مضبوط" }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const moyasarRes = await fetch(`https://api.moyasar.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${btoa(secretKey + ":")}`,
        "Content-Type": "application/json",
      },
    });

    const payment = await moyasarRes.json();

    if (!moyasarRes.ok) {
      const errMsg = payment?.message ?? "Moyasar: خطأ أثناء التحقق من الدفع";
      console.error("[verify-payment] Moyasar error:", errMsg);
      return new Response(
        JSON.stringify({ error: errMsg }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: moyasarRes.status }
      );
    }

    const isPaid = payment.status === "paid";

    const templateIds: string[] = (payment.metadata?.template_ids ?? "")
      .split(",")
      .map((id: string) => id.trim().replace(/[^a-zA-Z0-9_-]/g, ""))
      .filter((id: string) => Boolean(id) && id.length <= 100)
      .slice(0, 20);

    const src = payment.source ?? {};
    const cardCompany: string = String(src.company ?? src.type ?? "").slice(0, 50);
    const cardNumber: string = String(src.number ?? "").slice(0, 25);
    const cardName: string = String(src.name ?? "").slice(0, 100);
    const sourceType: string = String(src.type ?? "").slice(0, 30);

    console.log("[verify-payment] id:", paymentId, "status:", payment.status, "paid:", isPaid);

    return new Response(
      JSON.stringify({
        paid: isPaid,
        status: payment.status,
        templateIds,
        amountTotal: (payment.amount ?? 0) / 100,
        currency: payment.currency ?? "SAR",
        createdAt: payment.created_at,
        sourceType,
        cardCompany,
        cardNumber,
        cardName,
        description: String(payment.description ?? "").slice(0, 300),
        invoiceId: payment.invoice_id ?? null,
        // ملاحظة: لا نُعيد IP المستخدم للعميل (بيانات حساسة)
      }),
      { headers: { ...corsH, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[verify-payment] unhandled:", (error as Error).message);
    return new Response(
      JSON.stringify({ error: "خطأ داخلي في الخادم" }),
      { headers: { ...corsH, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
