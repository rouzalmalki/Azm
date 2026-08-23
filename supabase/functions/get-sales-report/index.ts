import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { getMoyasarKey } from "../_shared/getMoyasarKey.ts";

interface DailyRevenue { date: string; revenue: number; transactions: number; }
interface TemplateRevenue { templateTitle: string; templateId: string; units: number; revenue: number; }
interface PaymentMethodCount { method: string; label: string; count: number; revenue: number; }
interface RecentTransaction { id: string; cardName: string; cardCompany: string; sourceType: string; amount: number; currency: string; status: string; createdAt: string; }
interface MonthlyRevenue { month: string; label: string; revenue: number; transactions: number; }

serve(async (req) => {
  const corsH = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsH });
  }

  // ── حماية: POST + Admin-Token فقط ────────────────────────────────────────
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { headers: { ...corsH, "Content-Type": "application/json" }, status: 405 }
    );
  }

  const adminToken = Deno.env.get("ADMIN_API_TOKEN");
  const requestToken = req.headers.get("x-admin-token") ?? "";

  if (!adminToken || !requestToken || requestToken !== adminToken) {
    console.warn("[get-sales-report] unauthorized attempt from", req.headers.get("origin"));
    return new Response(
      JSON.stringify({ error: "غير مصرح" }),
      { headers: { ...corsH, "Content-Type": "application/json" }, status: 401 }
    );
  }

  try {
    // استخراج days من الـ body أو URL param (يدعم invoke)
    let rawDays = 30;
    try {
      const bodyText = await req.text();
      if (bodyText) {
        const parsed = JSON.parse(bodyText);
        if (parsed?.days) rawDays = parseInt(String(parsed.days), 10);
      }
    } catch { /* ignore, use default */ }
    // fallback: query string (للتوافق)
    const urlObj = new URL(req.url);
    const qDays = urlObj.searchParams.get("days");
    if (!rawDays && qDays) rawDays = parseInt(qDays, 10);
    const days = Math.min(Math.max(rawDays || 30, 1), 365);

    const secretKey = await getMoyasarKey();
    if (!secretKey) {
      return new Response(
        JSON.stringify({ error: "MOYASAR_SECRET_KEY غير مضبوط في الإعدادات" }),
        { headers: { ...corsH, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const authHeader = `Basic ${btoa(secretKey + ":")}`;

    let allPayments: Record<string, unknown>[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const res = await fetch(
        `https://api.moyasar.com/v1/payments?status=paid&per_page=${perPage}&page=${page}`,
        { method: "GET", headers: { "Authorization": authHeader, "Content-Type": "application/json" } }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = (errData as Record<string, string>)?.message ?? "Moyasar: خطأ أثناء جلب المدفوعات";
        return new Response(
          JSON.stringify({ error: errMsg }),
          { headers: { ...corsH, "Content-Type": "application/json" }, status: res.status }
        );
      }

      const pageData = await res.json() as { payments?: Record<string, unknown>[] };
      const payments = pageData.payments ?? [];
      allPayments = allPayments.concat(payments);
      if (payments.length < perPage) break;
      page++;
      if (allPayments.length >= 500) break;
    }

    const fromMs = Date.now() - days * 86_400_000;
    const periodPayments = allPayments.filter((p) => {
      const createdAt = p.created_at as string | undefined;
      return createdAt ? new Date(createdAt).getTime() >= fromMs : false;
    });

    function normaliseMethod(p: Record<string, unknown>): string {
      const src = (p.source ?? {}) as Record<string, string>;
      const company = (src.company ?? "").toLowerCase();
      const type = (src.type ?? "").toLowerCase();
      if (company.includes("mada") || type === "mada") return "mada";
      if (company.includes("visa")) return "visa";
      if (company.includes("master")) return "mastercard";
      if (type.includes("apple")) return "applepay";
      if (type.includes("stc")) return "stcpay";
      return "other";
    }

    const totalRevenue = periodPayments.reduce((s, p) => s + ((p.amount as number) ?? 0) / 100, 0);
    const totalTransactions = periodPayments.length;
    const avgCartValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const nowDate = new Date();
    const startOfMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1).getTime();
    const monthRevenue = allPayments
      .filter((p) => { const c = p.created_at as string; return c ? new Date(c).getTime() >= startOfMonth : false; })
      .reduce((s, p) => s + ((p.amount as number) ?? 0) / 100, 0);

    const dailyMap = new Map<string, { revenue: number; transactions: number }>();
    for (const p of periodPayments) {
      const d = new Date((p.created_at as string));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const ex = dailyMap.get(key) ?? { revenue: 0, transactions: 0 };
      dailyMap.set(key, { revenue: ex.revenue + (p.amount as number) / 100, transactions: ex.transactions + 1 });
    }
    const dailyRevenue: DailyRevenue[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86_400_000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const entry = dailyMap.get(key) ?? { revenue: 0, transactions: 0 };
      dailyRevenue.push({ date: key, ...entry });
    }

    const monthlyMap = new Map<string, { revenue: number; transactions: number }>();
    const sixMonthsAgo = Date.now() - 180 * 86_400_000;
    for (const p of allPayments) {
      const c = p.created_at as string;
      if (!c || new Date(c).getTime() < sixMonthsAgo) continue;
      const dt = new Date(c);
      const mKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      const prev = monthlyMap.get(mKey) ?? { revenue: 0, transactions: 0 };
      monthlyMap.set(mKey, { revenue: prev.revenue + (p.amount as number) / 100, transactions: prev.transactions + 1 });
    }
    const monthlyRevenue: MonthlyRevenue[] = [...monthlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, val]) => {
        const [y, m] = month.split("-");
        const label = new Date(Number(y), Number(m) - 1, 1).toLocaleString("ar-SA", { month: "long", year: "numeric" });
        return { month, label, ...val };
      });

    const METHOD_LABELS: Record<string, string> = { mada: "مدى", visa: "Visa", mastercard: "Mastercard", applepay: "Apple Pay", stcpay: "STC Pay", other: "أخرى" };
    const methodMap = new Map<string, { count: number; revenue: number }>();
    for (const p of periodPayments) {
      const method = normaliseMethod(p);
      const prev = methodMap.get(method) ?? { count: 0, revenue: 0 };
      methodMap.set(method, { count: prev.count + 1, revenue: prev.revenue + (p.amount as number) / 100 });
    }
    const paymentMethods: PaymentMethodCount[] = [...methodMap.entries()]
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([method, val]) => ({ method, label: METHOD_LABELS[method] ?? method, ...val }));

    const templateMap = new Map<string, TemplateRevenue>();
    for (const p of periodPayments) {
      const meta = (p.metadata ?? {}) as Record<string, string>;
      const templateIds = (meta.template_ids ?? "").split(",").map((id) => id.trim()).filter(Boolean);
      const perItemRevenue = (p.amount as number) / 100 / (templateIds.length || 1);
      templateIds.forEach((tid) => {
        const ex = templateMap.get(tid) ?? { templateTitle: `نموذج ${tid}`, templateId: tid, units: 0, revenue: 0 };
        templateMap.set(tid, { ...ex, units: ex.units + 1, revenue: ex.revenue + perItemRevenue });
      });
    }
    const topTemplates: TemplateRevenue[] = [...templateMap.values()].sort((a, b) => b.units - a.units).slice(0, 10);

    const recentTransactions: RecentTransaction[] = [...allPayments]
      .sort((a, b) => new Date((b.created_at as string) ?? 0).getTime() - new Date((a.created_at as string) ?? 0).getTime())
      .slice(0, 20)
      .map((p) => {
        const src = (p.source ?? {}) as Record<string, string>;
        return {
          id: String(p.id ?? ""),
          cardName: String(src.name ?? "").slice(0, 100),
          cardCompany: String(src.company ?? src.type ?? "").slice(0, 50),
          sourceType: String(src.type ?? "").slice(0, 30),
          amount: ((p.amount as number) ?? 0) / 100,
          currency: String(p.currency ?? "SAR"),
          status: String(p.status ?? "unknown"),
          createdAt: String(p.created_at ?? ""),
        };
      });

    return new Response(
      JSON.stringify({
        kpi: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalTransactions,
          avgCartValue: Math.round(avgCartValue * 100) / 100,
          monthRevenue: Math.round(monthRevenue * 100) / 100,
        },
        dailyRevenue,
        monthlyRevenue,
        topTemplates,
        paymentMethods,
        recentTransactions,
        period: days,
      }),
      { headers: { ...corsH, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[get-sales-report] unhandled:", (error as Error).message);
    return new Response(
      JSON.stringify({ error: "خطأ داخلي في الخادم" }),
      { headers: { ...corsH, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
