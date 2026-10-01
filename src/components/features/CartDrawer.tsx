import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShoppingCart, Trash2, CreditCard, Loader2, Package, ArrowLeft, ExternalLink, CheckCircle2, Hash, AlertCircle, Settings } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/lib/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, total, count, removeItem, clearCart } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentReady, setPaymentReady] = useState<{ url: string; paymentId: string } | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  // Detect admin session (for contextual help link)
  const isAdmin = (() => { try { return !!localStorage.getItem("azm_admin_auth"); } catch { return false; } })();
  const overlayRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Reset payment state when drawer closes
  useEffect(() => {
    if (!open) {
      setPaymentReady(null);
      setCheckoutError(null);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
  }, [open]);

  // Auto-redirect countdown when payment URL is ready
  useEffect(() => {
    if (!paymentReady) return;
    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          window.location.href = paymentReady.url;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [paymentReady]);

  const handleOpenPayment = () => {
    if (!paymentReady) return;
    if (countdownRef.current) clearInterval(countdownRef.current);
    window.location.href = paymentReady.url;
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setPaymentReady(null);
    setCheckoutError(null);
    setCheckoutLoading(true);

    const { data, error } = await supabase.functions.invoke("create-payment", {
      body: {
        cartItems: items.map((i) => ({
          templateId: i.templateId,
          templateTitle: i.templateTitle,
          price: i.price,
        })),
      },
    });

    if (error) {
      let msg = "تعذّر الاتصال ببوابة الدفع";
      if (error instanceof FunctionsHttpError) {
        try {
          const statusCode = error.context?.status ?? 500;
          const textContent = await error.context?.text();
          try {
            const parsed = JSON.parse(textContent ?? "");
            msg = parsed?.error ?? parsed?.message ?? textContent ?? error.message;
          } catch {
            msg = textContent || error.message || msg;
          }
          if (statusCode === 500 && msg.includes("MOYASAR_SECRET_KEY")) {
            msg = "MOYASAR_SECRET_KEY غير مضبوط — أضف مفتاح Moyasar من إعدادات لوحة التحكم";
          }
        } catch {
          msg = error.message || msg;
        }
      } else {
        msg = error.message || msg;
      }
      console.error("[cart-checkout] error:", msg);
      setCheckoutError(msg);
      setCheckoutLoading(false);
      return;
    }

    setCheckoutLoading(false);

    if (data?.url) {
      // Show order number + countdown instead of immediate redirect
      setPaymentReady({ url: data.url, paymentId: data.paymentId ?? "" });
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer — slides in from right (RTL start) */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B2A4A] flex items-center justify-center">
              <ShoppingCart size={15} strokeWidth={1.75} className="text-white" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-[#0B2A4A]">سلة التسوق</h2>
              {count > 0 && (
                <p className="text-xs text-gray-400">{count} نموذج</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {count > 0 && !paymentReady && !checkoutLoading && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
              >
                <Trash2 size={12} />
                مسح الكل
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {count === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <Package size={28} strokeWidth={1.5} className="text-gray-300" />
              </div>
              <p className="font-heading font-semibold text-gray-500 mb-1">السلة فارغة</p>
              <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                لم تُضف أي نماذج بعد.<br />تصفّح المكتبة واضغط "أضف للسلة"
              </p>
              <button
                onClick={() => { onClose(); navigate("/library"); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B2A4A] text-white text-sm font-medium hover:bg-[#0d3260] transition-colors"
              >
                <ArrowLeft size={14} className="rtl-flip" />
                تصفّح المكتبة
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 px-5 py-3">
              {items.map((item) => (
                <li key={item.templateId} className="flex items-start gap-3 py-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B2A4A] to-[#1a4a7a] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShoppingCart size={14} strokeWidth={1.75} className="text-white" />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0B2A4A] leading-snug line-clamp-2">
                      {item.templateTitle}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.templateCategory}</p>
                  </div>
                  {/* Price + Remove */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="font-bold text-sm text-[#0B2A4A]">
                      {item.price} ر.س
                    </span>
                    {!checkoutLoading && !paymentReady && (
                      <button
                        onClick={() => removeItem(item.templateId)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                        aria-label="حذف"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — checkout */}
        {count > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-white">

            {/* ── Error state ── */}
            {!checkoutLoading && !paymentReady && checkoutError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-red-600 mb-0.5">تعذّر بدء الدفع</p>
                    <p className="text-[11px] text-red-500 leading-relaxed break-words font-mono">{checkoutError}</p>
                  </div>
                  <button
                    onClick={() => setCheckoutError(null)}
                    className="text-red-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                  >
                    <X size={13} strokeWidth={2.5} />
                  </button>
                </div>
                {/* Contextual help for admin */}
                {isAdmin && checkoutError.includes("MOYASAR_SECRET_KEY") && (
                  <div className="flex items-center gap-2 pt-1 border-t border-red-200">
                    <Settings size={12} className="text-red-400 flex-shrink-0" strokeWidth={1.75} />
                    <p className="text-[11px] text-red-500 flex-1">
                      المفتاح غير مضبوط —{" "}
                      <button
                        onClick={() => { onClose(); navigate("/admin/settings"); }}
                        className="underline font-semibold text-red-600 hover:text-red-700 transition-colors"
                      >
                        اذهب إلى الإعدادات لإضافته
                      </button>
                    </p>
                  </div>
                )}
                {isAdmin && !checkoutError.includes("MOYASAR_SECRET_KEY") && (
                  <div className="flex items-center gap-2 pt-1 border-t border-red-200">
                    <Settings size={12} className="text-red-400 flex-shrink-0" strokeWidth={1.75} />
                    <p className="text-[11px] text-red-500">
                      <button
                        onClick={() => { onClose(); navigate("/admin/settings"); }}
                        className="underline font-semibold text-red-600 hover:text-red-700 transition-colors"
                      >
                        تحقق من إعدادات بوابة الدفع
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Loading state ── */}
            {checkoutLoading && (
              <div className="flex flex-col items-center justify-center gap-4 py-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-[#2BB6A3] border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingCart size={18} strokeWidth={1.75} className="text-[#2BB6A3]" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#0B2A4A]">جارٍ إنشاء طلب الدفع...</p>
                  <p className="text-xs text-gray-400 mt-1">يتم التواصل مع بوابة Moyasar</p>
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#2BB6A3] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 text-center">
                  الإجمالي: <span className="font-bold text-[#0B2A4A]">{total} ر.س</span>
                  {" — "}{count} نماذج
                </p>
              </div>
            )}

            {/* ── Payment ready state ── */}
            {!checkoutLoading && paymentReady && (
              <div className="space-y-3">
                {/* Success indicator */}
                <div className="flex flex-col items-center gap-2 py-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 size={26} strokeWidth={1.75} className="text-emerald-500" />
                  </div>
                  <p className="text-sm font-bold text-[#0B2A4A]">تم إنشاء الطلب بنجاح</p>
                  <p className="text-xs text-gray-400">
                    سيتم تحويلك تلقائياً خلال{" "}
                    <span className="font-bold text-[#2BB6A3]">{countdown}</span>{" "}
                    {countdown === 1 ? "ثانية" : "ثوانٍ"}...
                  </p>
                </div>

                {/* Order number */}
                {paymentReady.paymentId && (
                  <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5">
                    <Hash size={13} className="text-gray-400 flex-shrink-0" strokeWidth={1.75} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 font-medium mb-0.5">رقم الطلب</p>
                      <p className="text-xs font-mono text-[#0B2A4A] font-bold truncate" dir="ltr">
                        {paymentReady.paymentId}
                      </p>
                    </div>
                  </div>
                )}

                {/* Countdown progress bar */}
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2BB6A3] rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>

                {/* Manual open button */}
                <button
                  onClick={handleOpenPayment}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#2BB6A3] hover:bg-teal-500 text-white font-bold text-sm transition-colors shadow-sm"
                >
                  <ExternalLink size={15} strokeWidth={2} />
                  افتح صفحة الدفع الآن
                </button>

                <p className="text-center text-[10px] text-gray-400 leading-relaxed">
                  احتفظ برقم الطلب للمراجعة. إذا لم يتم التحويل تلقائياً، اضغط الزر أعلاه.
                </p>
              </div>
            )}

            {/* ── Normal checkout UI (hidden while loading or payment ready) ── */}
            {!checkoutLoading && !paymentReady && (
              <>
                {/* Breakdown */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>{count} نماذج × ١٠ ر.س</span>
                    <span>{total} ر.س</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#0B2A4A] text-base pt-1.5 border-t border-gray-100">
                    <span>الإجمالي</span>
                    <span className="text-[#2BB6A3]">{total} ر.س</span>
                  </div>
                </div>

                {/* Apple Pay quick button */}
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || !agreedToTerms}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50"
                  style={{ background: agreedToTerms ? "#111111" : "#888888" }}
                >
                  {checkoutLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  )}
                  {checkoutLoading ? "جارٍ التحويل..." : "Pay"}
                </button>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[10px] text-gray-400">أو</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Terms agreement */}
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`w-4 h-4 rounded border-2 transition-colors ${
                      agreedToTerms
                        ? 'bg-[#2BB6A3] border-[#2BB6A3]'
                        : 'bg-white border-gray-300'
                    } flex items-center justify-center`}>
                      {agreedToTerms && (
                        <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-none stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 4l3 3 5-6" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    أوافق على{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2BB6A3] underline hover:text-teal-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      شروط الاستخدام
                    </a>
                    {" "}— النموذج للاستخدام الشخصي أو المؤسسي الداخلي فقط، ويُحظر إعادة نشره أو بيعه أو توزيعه.
                  </p>
                </label>

                {/* Checkout button */}
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || !agreedToTerms}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#2BB6A3] hover:bg-teal-500 text-white font-bold text-sm transition-colors disabled:opacity-60 shadow-sm"
                >
                  {checkoutLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CreditCard size={16} strokeWidth={1.75} />
                  )}
                  {checkoutLoading ? "جارٍ التحويل للدفع..." : `إتمام الشراء — ${total} ر.س`}
                </button>

                <p className="text-center text-[10px] text-gray-400 leading-relaxed">
                  بإتمام الشراء أنت توافق على{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2BB6A3] underline hover:text-teal-600"
                  >
                    شروط الاستخدام
                  </a>
                  {" "}و{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2BB6A3] underline hover:text-teal-600"
                  >
                    سياسة الخصوصية
                  </a>
                </p>

                {!agreedToTerms && (
                  <p className="text-center text-[10px] text-amber-500">
                    يجب الموافقة على شروط الاستخدام لإتمام الشراء
                  </p>
                )}
                {agreedToTerms && (
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold" style={{ color: "#006B45", background: "#E6F4EF" }}>مدى</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold" style={{ color: "#1A1F71", background: "#EEF0FA" }}>VISA</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold" style={{ color: "#EB001B", background: "#FEF0F0" }}>MC</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold" style={{ color: "#ffffff", background: "#111111" }}>
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                      Pay
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
