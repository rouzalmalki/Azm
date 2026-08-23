
import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Download,
  ArrowRight,
  ShoppingBag,
  Loader2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Printer,
  CreditCard,
  Clock,
  Hash,
  User,
  FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useCart } from "@/hooks/useCart";
import { usePurchased } from "@/hooks/usePurchased";
import { useTemplates } from "@/hooks/useTemplates";

type VerifyState = "loading" | "success" | "failed" | "error";

interface VerifyResult {
  paid: boolean;
  templateIds: string[];
  amountTotal: number;
  currency: string;
  createdAt: string;
  sourceType: string;
  cardCompany: string;
  cardNumber: string;
  cardName: string;
  description: string;
  invoiceId: string | null;
  ip: string | null;
}

// Normalize company name → display label + color
function getCardInfo(company: string, sourceType: string) {
  const c = (company || sourceType || "").toLowerCase();
  if (c.includes("mada") || c === "mada") return { label: "مدى", color: "#006B45", bg: "#E6F4EF", abbr: "مدى" };
  if (c.includes("visa")) return { label: "Visa", color: "#1A1F71", bg: "#EEF0FA", abbr: "VISA" };
  if (c.includes("master")) return { label: "Mastercard", color: "#EB001B", bg: "#FEF0F0", abbr: "MC" };
  if (c.includes("amex") || c.includes("american")) return { label: "Amex", color: "#006FCF", bg: "#EBF5FF", abbr: "AMEX" };
  if (c.includes("apple")) return { label: "Apple Pay", color: "#000000", bg: "#F5F5F5", abbr: "AP" };
  if (c.includes("stc")) return { label: "STC Pay", color: "#6B0E8C", bg: "#F5EBF9", abbr: "STC" };
  return { label: "بطاقة بنكية", color: "#0B2A4A", bg: "#EBF0F6", abbr: "Card" };
}

function formatArabicDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("ar-SA", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function maskCard(num: string) {
  if (!num) return "—";
  // Moyasar returns e.g. "400555XXXXXX0001" or "XXXX-XXXX-XXXX-1234"
  const digits = num.replace(/\D/g, "");
  if (digits.length >= 4) return `•••• •••• •••• ${digits.slice(-4)}`;
  return num;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("id");
  const sessionId = searchParams.get("session_id"); // legacy fallback

  const { clearCart } = useCart();
  const { addPurchased } = usePurchased();
  const { templates: ALL_TEMPLATES } = useTemplates();
  const receiptRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<VerifyState>("loading");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const activeId = paymentId || sessionId;
    if (!activeId) {
      setState("success");
      clearCart();
      return;
    }

    let cancelled = false;
    (async () => {
      const body = paymentId ? { paymentId } : { sessionId };
      const { data, error } = await supabase.functions.invoke("verify-payment", { body });

      if (cancelled) return;

      if (error) {
        let msg = error.message;
        if (error instanceof FunctionsHttpError) {
          try { msg = (await error.context?.text()) || msg; } catch { /* ignore */ }
        }
        console.error("[verify-payment]", msg);
        setErrorMsg(msg);
        setState("error");
        return;
      }

      const res = data as VerifyResult;
      if (!res.paid) { setState("failed"); return; }

      addPurchased(res.templateIds, paymentId ?? sessionId ?? "moyasar");
      clearCart();
      setResult(res);
      setState("success");
    })();

    return () => { cancelled = true; };
  }, [paymentId, sessionId, clearCart, addPurchased]); // Added missing dependencies

  // ── Print handler ─────────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  // ── Loading ───────────────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
          <Loader2 size={40} className="text-[#2BB6A3] animate-spin mx-auto mb-5" />
          <h2 className="font-heading font-semibold text-[#0B2A4A] text-lg mb-2">جارٍ التحقق من الدفع...</h2>
          <p className="text-gray-400 text-sm">يرجى الانتظار لحظة</p>
        </div>
      </div>
    );
  }

  // ── Failed ────────────────────────────────────────────────────────────────
  if (state === "failed") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <XCircle size={32} className="text-red-400" />
          </div>
          <h1 className="font-heading font-bold text-xl text-[#0B2A4A] mb-2">لم يتم تأكيد الدفع</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            جلسة الدفع غير مكتملة أو لم تتم المعالجة بعد. يرجى المحاولة مجدداً.
          </p>
          <Link to="/library" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0B2A4A] text-white text-sm font-semibold hover:bg-[#0d3260] transition-colors">
            العودة للمكتبة
          </Link>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (state === "error") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={32} className="text-amber-400" />
          </div>
          <h1 className="font-heading font-bold text-xl text-[#0B2A4A] mb-2">تعذّر التحقق من الدفع</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">تمت عملية الدفع، لكن لم نتمكن من التحقق منها الآن.</p>
          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mb-6 font-mono text-right">{errorMsg}</p>
          <div className="flex flex-col gap-2">
            <Link to="/library" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2BB6A3] text-white text-sm font-semibold hover:bg-teal-600 transition-colors">
              <Download size={16} /> تصفّح المكتبة
            </Link>
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">العودة للرئيسية</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  const purchasedTemplates = result ? ALL_TEMPLATES.filter((t) => result.templateIds.includes(t.id)) : [];
  const cardInfo = result ? getCardInfo(result.cardCompany, result.sourceType) : null;
  const txRef = paymentId ?? sessionId ?? "—";

  return (
    <>
      {/* ── Print styles (injected globally, only visible during print) ── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-receipt, #print-receipt * { visibility: visible !important; }
          #print-receipt {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 32px !important;
            background: white !important;
            font-family: 'Tajawal', sans-serif !important;
            direction: rtl !important;
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="min-h-[60vh] flex items-center justify-center px-4 py-10" dir="rtl">
        <div className="w-full max-w-xl space-y-4">

          {/* ── Receipt card ── */}
          <div id="print-receipt" ref={receiptRef} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Header gradient */}
            <div className="px-6 pt-7 pb-5 text-center" style={{ background: "linear-gradient(135deg, #0B2A4A 0%, #0F3A60 100%)" }}>
              <div className="w-14 h-14 rounded-full bg-emerald-400/20 border-2 border-emerald-400/40 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <h1 className="font-heading font-bold text-xl text-white mb-1">تمت عملية الدفع بنجاح</h1>
              <p className="text-white/50 text-xs">إيصال دفع رسمي — منصة عزم</p>

              {/* Amount pill */}
              {result && (
                <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mt-3">
                  <span className="text-white/70 text-xs">الإجمالي</span>
                  <span className="font-heading font-bold text-white text-base">
                    {result.amountTotal.toLocaleString("ar-SA")} ر.س
                  </span>
                </div>
              )}
            </div>

            {/* Details grid */}
            <div className="px-6 py-5 space-y-3">

              {/* Transaction reference */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-[#0B2A4A]/10 flex items-center justify-center flex-shrink-0">
                  <Hash size={15} className="text-[#0B2A4A]" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-gray-400 mb-0.5">رقم المعاملة</p>
                  <p className="text-xs font-mono font-semibold text-[#0B2A4A] truncate">{txRef}</p>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-shrink-0">مدفوع ✓</span>
              </div>

              {/* 2-column row: payment method + date */}
              <div className="grid grid-cols-2 gap-3">
                {/* Payment method */}
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CreditCard size={13} className="text-gray-400" strokeWidth={1.75} />
                    <p className="text-[10px] font-medium text-gray-400">طريقة الدفع</p>
                  </div>
                  {cardInfo ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                        style={{ color: cardInfo.color, backgroundColor: cardInfo.bg }}
                      >
                        {cardInfo.abbr}
                      </span>
                      <span className="text-xs font-semibold text-[#0B2A4A]">{cardInfo.label}</span>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-[#0B2A4A]">—</p>
                  )}
                </div>

                {/* Date/time */}
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Clock size={13} className="text-gray-400" strokeWidth={1.75} />
                    <p className="text-[10px] font-medium text-gray-400">التاريخ والوقت</p>
                  </div>
                  <p className="text-[11px] font-semibold text-[#0B2A4A] leading-snug">
                    {result?.createdAt ? formatArabicDate(result.createdAt) : "—"}
                  </p>
                </div>
              </div>

              {/* 2-column row: cardholder + card number */}
              {result && (result.cardName || result.cardNumber) && (
                <div className="grid grid-cols-2 gap-3">
                  {result.cardName && (
                    <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <User size={13} className="text-gray-400" strokeWidth={1.75} />
                        <p className="text-[10px] font-medium text-gray-400">اسم حامل البطاقة</p>
                      </div>
                      <p className="text-xs font-semibold text-[#0B2A4A] truncate">{result.cardName}</p>
                    </div>
                  )}
                  {result.cardNumber && (
                    <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <CreditCard size={13} className="text-gray-400" strokeWidth={1.75} />
                        <p className="text-[10px] font-medium text-gray-400">رقم البطاقة</p>
                      </div>
                      <p className="text-xs font-mono font-semibold text-[#0B2A4A] tracking-wider">
                        {maskCard(result.cardNumber)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200 my-1" />

              {/* Purchased templates */}
              {purchasedTemplates.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <FileText size={13} className="text-[#2BB6A3]" strokeWidth={1.75} />
                    <p className="text-xs font-semibold text-gray-500">
                      النماذج المشتراة ({purchasedTemplates.length})
                    </p>
                  </div>
                  <div className="space-y-2">
                    {purchasedTemplates.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-2.5 hover:border-teal-200 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                          <FileText size={13} className="text-[#2BB6A3]" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#0B2A4A] truncate">{tpl.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{tpl.category.replace(/_/g, " ")}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 no-print">
                          {tpl.wordUrl && (
                            <a
                              href={tpl.wordUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#0B2A4A] text-[#0B2A4A] text-[10px] font-semibold hover:bg-[#0B2A4A] hover:text-white transition-colors"
                            >
                              <Download size={10} strokeWidth={2} /> Word
                            </a>
                          )}
                          {tpl.pdfUrl && (
                            <a
                              href={tpl.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#2BB6A3] text-[#2BB6A3] text-[10px] font-semibold hover:bg-[#2BB6A3] hover:text-white transition-colors"
                            >
                              <Download size={10} strokeWidth={2} /> PDF
                            </a>
                          )}
                          {!tpl.wordUrl && !tpl.pdfUrl && (
                            <Link
                              to={`/template/${tpl.id}`}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 text-gray-500 text-[10px] border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <ExternalLink size={10} /> عرض
                            </Link>
                          )}
                        </div>
                        {/* Print-only price column */}
                        <div className="print-only text-[10px] text-gray-500">10 ر.س</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total row */}
              {result && (
                <div className="flex items-center justify-between bg-[#0B2A4A] rounded-xl px-4 py-3 mt-1">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={15} strokeWidth={1.75} className="text-white/60" />
                    <span className="text-white/70 text-xs">{result.templateIds.length} نماذج مشتراة</span>
                  </div>
                  <span className="font-heading font-bold text-[#2BB6A3] text-base">
                    {result.amountTotal.toLocaleString("ar-SA")} ر.س
                  </span>
                </div>
              )}

              {/* Print footer — visible only during print */}
              <div className="print-only pt-4 border-t border-gray-200 text-center">
                <p className="text-[10px] text-gray-400">منصة عزم للنماذج المؤسسية — azm.sa</p>
                <p className="text-[10px] text-gray-400 mt-1">جميع الحقوق محفوظة · هذا الإيصال وثيقة رسمية</p>
              </div>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex flex-col gap-2 no-print">
            {/* Print receipt */}
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#0B2A4A] text-[#0B2A4A] text-sm font-bold hover:bg-[#0B2A4A] hover:text-white transition-colors"
            >
              <Printer size={16} strokeWidth={2} />
              طباعة / تنزيل الإيصال PDF
            </button>

            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/library"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2BB6A3] text-white text-sm font-semibold hover:bg-teal-600 transition-colors"
              >
                <Download size={15} />
                تصفّح المكتبة
              </Link>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
              >
                <ArrowRight size={15} className="rtl-flip" />
                الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
