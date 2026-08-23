import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { getMoyasarKey } from "../_shared/getMoyasarKey.ts";

const MAX_CART_ITEMS = 20;  // سقف حماية: لا يزيد الطلب عن 20 نموذج
const MAX_ITEM_PRICE = 10;  // السعر الثابت للتحقق من التلاعب في السعر

interface CartItem {
  templateId: string;
  templateTitle: string;
  price: number;
}

serve(async (req) => {
  const corsH = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsH });
  }

  // قبول POST فقط
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
        JSON.stringify({ error: "طلب غير صالح: JSON مشوّه" }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // دعم طلب فردي أو سلة
    const rawItems: CartItem[] = Array.isArray(body.cartItems)
      ? (body.cartItems as CartItem[])
      : [{
          templateId: String(body.templateId ?? "").trim(),
          templateTitle: String(body.templateTitle ?? "نموذج رسمي").slice(0, 200),
          price: MAX_ITEM_PRICE,
        }];

    // ── التحقق من المدخلات ────────────────────────────────────────────────
    if (rawItems.length === 0) {
      return new Response(
        JSON.stringify({ error: "السلة فارغة" }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (rawItems.length > MAX_CART_ITEMS) {
      return new Response(
        JSON.stringify({ error: `الحد الأقصى ${MAX_CART_ITEMS} نموذج في الطلب الواحد` }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // تعقيم وتثبيت السعر (لا نثق بالسعر القادم من العميل)
    const cartItems: CartItem[] = rawItems.map((item) => ({
      templateId: String(item.templateId ?? "").trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100),
      templateTitle: String(item.templateTitle ?? "نموذج").slice(0, 200),
      price: MAX_ITEM_PRICE, // السعر مثبّت دائماً في الخادم
    }));

    // التحقق من templateId غير فارغ
    const invalidItems = cartItems.filter((i) => !i.templateId);
    if (invalidItems.length > 0) {
      return new Response(
        JSON.stringify({ error: "يحتوي الطلب على عناصر بدون templateId" }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const secretKey = await getMoyasarKey();
    if (!secretKey) {
      return new Response(
        JSON.stringify({ error: "MOYASAR_SECRET_KEY غير مضبوط في الإعدادات" }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const origin = req.headers.get("origin") ?? "https://wuzzjixykkmjpdcjwuzz.onspace.app";

    // الإجمالي محسوب في الخادم بالسعر الثابت
    const totalSAR = cartItems.length * MAX_ITEM_PRICE;
    const amountHalalas = totalSAR * 100;

    const templateIds = cartItems.map((i) => i.templateId).join(",");
    const description =
      cartItems.length === 1
        ? cartItems[0].templateTitle
        : `${cartItems.length} نماذج — منصة عزم`;

    const callbackUrl = `${origin}/payment-success?templates=${encodeURIComponent(templateIds)}`;

    const moyasarRes = await fetch("https://api.moyasar.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(secretKey + ":")}`,
      },
      body: JSON.stringify({
        amount: amountHalalas,
        currency: "SAR",
        description,
        callback_url: callbackUrl,
        source: { type: "creditcard" },
        metadata: {
          template_ids: templateIds,
          item_count: String(cartItems.length),
          origin,
        },
      }),
    });

    const moyasarData = await moyasarRes.json();

    if (!moyasarRes.ok) {
      const errMsg = moyasarData?.message ?? moyasarData?.errors?.join(", ") ?? "Moyasar: خطأ أثناء إنشاء الدفع";
      console.error("[create-payment] Moyasar error:", errMsg);
      return new Response(
        JSON.stringify({ error: errMsg }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: moyasarRes.status }
      );
    }

    const paymentUrl: string =
      moyasarData?.source?.transaction_url ?? moyasarData?.url ?? "";

    if (!paymentUrl) {
      console.error("[create-payment] no payment URL:", JSON.stringify(moyasarData).slice(0, 200));
      return new Response(
        JSON.stringify({ error: "لم يتم استلام رابط الدفع من Moyasar" }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("[create-payment] payment_id:", moyasarData.id, "items:", cartItems.length, "total:", totalSAR, "SAR");

    return new Response(
      JSON.stringify({ url: paymentUrl, paymentId: moyasarData.id }),
      { headers: { ...corsH, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[create-payment] unhandled:", (error as Error).message);
    return new Response(
      JSON.stringify({ error: "خطأ داخلي في الخادم" }),
      { headers: { ...corsH, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
