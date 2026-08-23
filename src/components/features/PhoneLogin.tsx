import { useState, useRef } from "react";
import { Phone, Shield, ArrowLeft, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth, normalizePhone } from "@/hooks/useAuth";
import logoSrc from "@/assets/logo.jpg";

interface PhoneLoginProps {
  onSuccess?: () => void;
}

export default function PhoneLogin({ onSuccess }: PhoneLoginProps) {
  const { sendOtp, verifyOtp, otpSent, setOtpSent } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Cooldown timer ──────────────────────────────────────────────
  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Send OTP ────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const trimmed = phone.trim();
    if (!trimmed) { toast.error("أدخل رقم الجوال"); return; }
    setLoading(true);
    try {
      await sendOtp(trimmed);
      toast.success("تم إرسال رمز التحقق على جوالك");
      startCooldown();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "تعذّر إرسال الرمز";
      toast.error(msg.includes("rate") ? "تجاوزت الحد المسموح، انتظر قليلاً" : "تعذّر إرسال الرمز");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setLoading(true);
    try {
      await sendOtp(phone.trim());
      toast.success("تم إعادة إرسال الرمز");
      startCooldown();
    } catch {
      toast.error("تعذّر إعادة الإرسال");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Input handling ──────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  // ── Verify OTP ──────────────────────────────────────────────────
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { toast.error("أدخل الرمز المكوّن من 6 أرقام"); return; }
    setLoading(true);
    try {
      await verifyOtp(phone.trim(), code);
      toast.success("تم تسجيل الدخول بنجاح");
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(msg.includes("expired") ? "انتهت صلاحية الرمز، أعد الإرسال" : "رمز غير صحيح، تأكد وأعد المحاولة");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const normalizedDisplay = phone.trim() ? normalizePhone(phone.trim()) : "";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Logo + heading */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoSrc} alt="عزم" className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0" />
            <div className="text-right">
              <p className="font-heading font-bold text-lg text-primary-500 leading-tight">عزم</p>
              <p className="text-text-secondary text-xs leading-tight">حوكمة الوثائق والنماذج</p>
            </div>
          </div>
          <h1 className="font-heading font-bold text-2xl text-primary-500">تسجيل الدخول</h1>
          <p className="text-text-secondary text-sm mt-1">ادخل برقم جوالك للوصول إلى حسابك</p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          {!otpSent ? (
            /* ── Step 1: Phone number ── */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  رقم الجوال
                </label>
                <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal/30 focus-within:border-teal transition-all">
                  {/* Flag + country code */}
                  <div className="flex items-center gap-1.5 px-3 py-3 bg-gray-50 border-l border-border flex-shrink-0">
                    <span className="text-lg leading-none">🇸🇦</span>
                    <span className="text-sm font-semibold text-text-secondary">+966</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                    className="flex-1 px-3 py-3 text-sm bg-white text-text-primary placeholder:text-text-muted focus:outline-none"
                    inputMode="numeric"
                    autoComplete="tel"
                  />
                </div>
                {normalizedDisplay && (
                  <p className="text-xs text-text-muted mt-1 text-left" dir="ltr">
                    سيُرسل الرمز إلى: {normalizedDisplay}
                  </p>
                )}
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading || !phone.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0B2A4A] hover:bg-[#0d3260] text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Phone size={16} strokeWidth={1.75} />
                )}
                إرسال رمز التحقق
              </button>

              <p className="text-center text-xs text-text-muted">
                سيتم إرسال رمز مكوّن من 6 أرقام عبر SMS
              </p>
            </div>
          ) : (
            /* ── Step 2: OTP Verification ── */
            <div className="space-y-5">
              {/* Back button */}
              <button
                onClick={() => { setOtpSent(false); setOtp(["", "", "", "", "", ""]); }}
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                <ArrowLeft size={13} strokeWidth={2} />
                تغيير رقم الجوال
              </button>

              {/* Success indicator */}
              <div className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-200 rounded-xl">
                <CheckCircle2 size={20} className="text-[#2BB6A3] flex-shrink-0" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-semibold text-[#0B2A4A]">تم الإرسال</p>
                  <p className="text-xs text-text-secondary" dir="ltr">{normalizedDisplay}</p>
                </div>
              </div>

              {/* OTP boxes */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  رمز التحقق
                </label>
                <div className="flex gap-2 justify-center" dir="ltr" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-xl transition-all focus:outline-none ${
                        digit
                          ? "border-[#2BB6A3] bg-teal-50 text-[#0B2A4A]"
                          : "border-border bg-white text-text-primary focus:border-[#2BB6A3]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Verify button */}
              <button
                onClick={handleVerify}
                disabled={loading || otp.join("").length < 6}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2BB6A3] hover:bg-teal-600 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Shield size={16} strokeWidth={1.75} />
                )}
                تحقق وادخل
              </button>

              {/* Resend */}
              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-xs text-text-muted">
                    إعادة الإرسال بعد{" "}
                    <span className="font-bold text-[#0B2A4A]">{resendCooldown}</span> ثانية
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs text-teal hover:underline mx-auto transition-colors"
                  >
                    <RefreshCw size={12} strokeWidth={2} />
                    إعادة إرسال الرمز
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-text-muted mt-4">
          بتسجيل الدخول، أنت توافق على{" "}
          <a href="/terms" className="text-teal hover:underline">شروط الاستخدام</a>
          {" "}و{" "}
          <a href="/privacy" className="text-teal hover:underline">سياسة الخصوصية</a>
        </p>
      </div>
    </div>
  );
}
