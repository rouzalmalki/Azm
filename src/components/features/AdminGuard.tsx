import { useState } from "react";
import { Eye, EyeOff, Lock, Shield, AlertCircle } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/lib/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { adminTokenStore } from "@/lib/adminToken";
import logo from "@/assets/logo.jpg";

const STORAGE_KEY = "azm_admin_auth";

interface Props {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: Props) {
  const [auth, setAuth] = useLocalStorage<boolean>(STORAGE_KEY, false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // If already authenticated (page refresh), still need the in-memory token.
  // We'll show the login form again if token is missing (tab was closed).
  const isReady = auth && adminTokenStore.get() !== null;

  if (isReady) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-auth", {
        body: { password },
      });

      if (fnError) {
        let msg = "كلمة المرور غير صحيحة";
        if (fnError instanceof FunctionsHttpError) {
          try {
            const raw = await fnError.context?.text();
            const parsed = JSON.parse(raw ?? "");
            msg = parsed?.error ?? msg;
          } catch { /* ignore */ }
        }
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError(newAttempts >= 3
          ? `${msg} — تحقق من البيانات.`
          : msg
        );
        setPassword("");
        setLoading(false);
        return;
      }

      // Store token in memory only (never in localStorage/bundle)
      if (data?.token) {
        adminTokenStore.set(data.token);
      }

      setAuth(true);
      setLoading(false);
    } catch {
      setError("تعذّر الاتصال بالخادم. أعد المحاولة.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      dir="rtl"
      style={{ background: "linear-gradient(135deg, #0B2A4A 0%, #0F3A60 60%, #143D5E 100%)" }}>
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-white opacity-[0.03] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#2BB6A3] opacity-[0.05] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className="px-8 pt-8 pb-6 text-center"
            style={{ background: "linear-gradient(135deg, #0B2A4A 0%, #0F3A60 100%)" }}>
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mx-auto mb-4">
              <img src={logo} alt="عزم" className="w-11 h-11 object-contain" />
            </div>
            <h1 className="font-heading font-bold text-white text-lg">لوحة تحكم عزم</h1>
            <p className="text-white/60 text-xs mt-1">أدخل كلمة المرور للدخول</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
            {/* Shield badge */}
            <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2.5">
              <Shield size={15} className="text-[#2BB6A3] flex-shrink-0" strokeWidth={1.75} />
              <p className="text-xs text-teal-700 font-medium">هذه الصفحة محمية — للمسؤولين فقط</p>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-semibold text-[#0B2A4A] mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  strokeWidth={1.75}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="أدخل كلمة المرور..."
                  autoFocus
                  className={`w-full border rounded-lg pr-9 pl-10 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none transition-all ${
                    error
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-teal-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? (
                    <EyeOff size={15} strokeWidth={1.75} />
                  ) : (
                    <Eye size={15} strokeWidth={1.75} />
                  )}
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-1.5 mt-2">
                  <AlertCircle size={13} className="text-red-400 flex-shrink-0" strokeWidth={2} />
                  <p className="text-red-400 text-[11px]">{error}</p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!password || loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0B2A4A] hover:bg-[#0d3360] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جارٍ التحقق...
                </>
              ) : (
                <>
                  <Lock size={15} strokeWidth={2} />
                  دخول
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-6 text-center">
            <p className="text-[11px] text-gray-400">
              لإعادة تعيين كلمة المرور تواصل مع المطور
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-5">
          <a
            href="/"
            className="text-white/50 hover:text-white/80 text-xs transition-colors">
            ← العودة إلى الموقع
          </a>
        </div>
      </div>
    </div>
  );
}
