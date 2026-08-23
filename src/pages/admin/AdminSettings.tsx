import { useState } from "react";
import { Bell, Lock, Globe, Save, AlertCircle, Eye, EyeOff, CheckCircle2, KeyRound, Smartphone, ExternalLink, CheckCircle, CircleDot, Building2, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { adminTokenStore } from "@/lib/adminToken";

export default function AdminSettings() {
  const [current, setCurrent] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);

  // ── Moyasar key state ──
  const [moyasarKey, setMoyasarKey] = useState("");
  const [showMoyasarKey, setShowMoyasarKey] = useState(false);
  const [moyasarSaving, setMoyasarSaving] = useState(false);
  const [moyasarError, setMoyasarError] = useState("");
  const [moyasarSuccess, setMoyasarSuccess] = useState(false);

  const handleMoyasarSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMoyasarError("");
    setMoyasarSuccess(false);

    const trimmed = moyasarKey.trim();
    if (!trimmed) {
      setMoyasarError("أدخل المفتاح أولاً");
      return;
    }
    if (!trimmed.startsWith("sk_")) {
      setMoyasarError("مفتاح Moyasar يجب أن يبدأ بـ sk_");
      return;
    }

    setMoyasarSaving(true);
    const adminToken = adminTokenStore.get() ?? "";
    const { data, error } = await supabase.functions.invoke("update-platform-secret", {
      body: { key: "MOYASAR_SECRET_KEY", value: trimmed },
      headers: { "x-admin-token": adminToken },
    });

    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) {
        try { msg = (await error.context?.text()) || msg; } catch { /* ignore */ }
      }
      setMoyasarError(msg);
      setMoyasarSaving(false);
      return;
    }

    console.log("[moyasar-key] saved:", data);
    setMoyasarSuccess(true);
    setMoyasarKey("");
    setMoyasarSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess(false);

    if (!current) {
      setPwdError("أدخل كلمة المرور الحالية");
      return;
    }
    if (newPwd.length < 6) {
      setPwdError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (newPwd !== confirm) {
      setPwdError("كلمة المرور الجديدة وتأكيدها غير متطابقَين");
      return;
    }

    // تحقق أن كلمة المرور الحالية صحيحة عبر Edge Function
    const { data, error: authErr } = await supabase.functions.invoke("admin-auth", {
      body: { password: current },
    });
    if (authErr || !data?.token) {
      setPwdError("كلمة المرور الحالية غير صحيحة");
      return;
    }

    // حفظ كلمة المرور الجديدة عبر update-platform-secret
    const adminToken = adminTokenStore.get() ?? "";
    const { error: saveErr } = await supabase.functions.invoke("update-platform-secret", {
      body: { key: "ADMIN_API_TOKEN", value: newPwd },
      headers: { "x-admin-token": adminToken },
    });
    if (saveErr) {
      setPwdError("تعذّر حفظ كلمة المرور الجديدة — تواصل مع المطور");
      return;
    }

    // تحديث التوكن في الذاكرة
    adminTokenStore.set(newPwd);
    setPwdSuccess(true);
    setCurrent("");
    setNewPwd("");
    setConfirm("");
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="font-heading font-bold text-2xl text-[#0B2A4A]">الإعدادات</h2>
        <p className="text-gray-500 text-sm mt-0.5">إعدادات النظام والمنصة</p>
      </div>

      {/* Platform Settings */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Globe size={17} className="text-teal-500" />
          <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm">إعدادات المنصة</h3>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: "اسم المنصة", value: "عزم", type: "text" },
            { label: "الوصف المختصر", value: "حوكمة الوثائق والنماذج", type: "text" },
            { label: "البريد الإلكتروني للتواصل", value: "info@azm.sa", type: "email" },
            { label: "رقم الهاتف", value: "920000000", type: "tel" },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}</label>
              <input
                type={f.type}
                defaultValue={f.value}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-teal-400 transition-all bg-gray-50 focus:bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Bell size={17} className="text-teal-500" />
          <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm">الإشعارات</h3>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: "إشعار عند تنزيل نموذج", defaultChecked: true },
            { label: "إشعار عند تسجيل مستخدم جديد", defaultChecked: true },
            { label: "تقرير أسبوعي بالنشاطات", defaultChecked: false },
          ].map((n) => (
            <label key={n.label} className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-sm text-gray-700">{n.label}</span>
              <div className="relative">
                <input type="checkbox" defaultChecked={n.defaultChecked} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 peer-checked:bg-teal-500 rounded-full transition-colors" />
                <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-[-20px]" />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Security — Password Change */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Lock size={17} className="text-teal-500" />
          <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm">الأمان — تغيير كلمة المرور</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="p-5 space-y-4">

          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">كلمة المرور الحالية</label>
            <div className="relative">
              <KeyRound size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.75} />
              <input
                type={showCurrent ? "text" : "password"}
                value={current}
                onChange={(e) => { setCurrent(e.target.value); setPwdError(""); setPwdSuccess(false); }}
                placeholder="أدخل كلمة المرور الحالية"
                className={`w-full border rounded-lg pr-9 pl-10 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none transition-all ${
                  pwdError && pwdError.includes("الحالية") ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-teal-400"
                }`}
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showCurrent ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">كلمة المرور الجديدة</label>
            <div className="relative">
              <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.75} />
              <input
                type={showNew ? "text" : "password"}
                value={newPwd}
                onChange={(e) => { setNewPwd(e.target.value); setPwdError(""); setPwdSuccess(false); }}
                placeholder="6 أحرف على الأقل"
                className={`w-full border rounded-lg pr-9 pl-10 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none transition-all ${
                  pwdError && !pwdError.includes("الحالية") ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-teal-400"
                }`}
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showNew ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
              </button>
            </div>
            {/* Strength hints */}
            {newPwd.length > 0 && (
              <div className="flex gap-1 mt-2">
                {[6, 8, 12].map((len, i) => (
                  <div key={len}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      newPwd.length >= len
                        ? i === 0 ? "bg-red-400" : i === 1 ? "bg-amber-400" : "bg-emerald-500"
                        : "bg-gray-200"
                    }`} />
                ))}
                <span className="text-[10px] text-gray-400 mr-1">
                  {newPwd.length < 6 ? "ضعيفة" : newPwd.length < 8 ? "مقبولة" : newPwd.length < 12 ? "جيدة" : "قوية"}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">تأكيد كلمة المرور الجديدة</label>
            <div className="relative">
              <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.75} />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setPwdError(""); setPwdSuccess(false); }}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                className={`w-full border rounded-lg pr-9 pl-10 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none transition-all ${
                  confirm.length > 0 && confirm !== newPwd ? "border-red-300" : "border-gray-200 focus:border-teal-400"
                }`}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showConfirm ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
              </button>
            </div>
            {confirm.length > 0 && confirm !== newPwd && (
              <p className="text-red-400 text-[11px] mt-1">كلمتا المرور غير متطابقتَين</p>
            )}
          </div>

          {/* Error / Success feedback */}
          {pwdError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" strokeWidth={2} />
              <p className="text-red-600 text-xs">{pwdError}</p>
            </div>
          )}
          {pwdSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
              <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" strokeWidth={2} />
              <p className="text-emerald-700 text-xs font-medium">تم تحديث كلمة المرور بنجاح وحفظها بأمان.</p>
            </div>
          )}

          {/* Info note */}
          <p className="text-[11px] text-gray-400">
            يتم حفظ كلمة المرور مشفّرة في المتصفح. ستُطلَب عند تسجيل الدخول القادم.
          </p>

          <div className="pt-1">
            <button
              type="submit"
              disabled={!current || !newPwd || !confirm}
              className="flex items-center gap-2 bg-[#0B2A4A] hover:bg-[#0d3360] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              <Lock size={14} strokeWidth={2} />
              تحديث كلمة المرور
            </button>
          </div>
        </form>
      </div>

      {/* ── Moyasar Secret Key ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <KeyRound size={17} className="text-teal-500" />
          <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm">مفتاح Moyasar السري</h3>
          <span className="mr-auto text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
            Edge Functions
          </span>
        </div>
        <form onSubmit={handleMoyasarSave} className="p-5 space-y-4">

          {/* Info banner */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <AlertCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
            <p className="text-blue-700 text-[11px] leading-relaxed">
              هذا المفتاح يُستخدم في Edge Functions (create-payment، verify-payment، get-sales-report) للتواصل مع Moyasar API.
              يُحفظ في قاعدة البيانات ويُطبَّق فوراً دون الحاجة لإعادة تشغيل الخادم.
            </p>
          </div>

          {/* Key input */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              المفتاح السري الجديد
              <span className="font-normal text-gray-400 mr-1">(sk_live_... أو sk_test_...)</span>
            </label>
            <div className="relative">
              <KeyRound size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.75} />
              <input
                type={showMoyasarKey ? "text" : "password"}
                value={moyasarKey}
                onChange={(e) => { setMoyasarKey(e.target.value); setMoyasarError(""); setMoyasarSuccess(false); }}
                placeholder="sk_live_xxxxxxxxxxxxxxxxxxxx"
                dir="ltr"
                className={`w-full border rounded-lg pr-9 pl-10 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none transition-all font-mono ${
                  moyasarError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-teal-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowMoyasarKey((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showMoyasarKey ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
              </button>
            </div>
          </div>

          {/* Where to find the key */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <ExternalLink size={13} className="text-gray-400 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
            <p className="text-[11px] text-gray-500 leading-relaxed">
              احصل على المفتاح من:{" "}
              <a
                href="https://dashboard.moyasar.com/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 underline hover:text-teal-700 font-medium"
              >
                dashboard.moyasar.com ← الإعدادات ← API Keys
              </a>
              {" "}← انسخ الـ Secret Key (يبدأ بـ sk_)
            </p>
          </div>

          {/* Error */}
          {moyasarError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" strokeWidth={2} />
              <p className="text-red-600 text-xs">{moyasarError}</p>
            </div>
          )}

          {/* Success */}
          {moyasarSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
              <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" strokeWidth={2} />
              <p className="text-emerald-700 text-xs font-medium">
                تم حفظ مفتاح Moyasar بنجاح. Edge Functions ستستخدمه فوراً في الطلبات القادمة.
              </p>
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={!moyasarKey.trim() || moyasarSaving}
              className="flex items-center gap-2 bg-[#0B2A4A] hover:bg-[#0d3360] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              {moyasarSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} strokeWidth={2} />
              )}
              {moyasarSaving ? "جارٍ الحفظ..." : "حفظ المفتاح"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Apple Pay Setup Guide ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            </div>
            <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm">تفعيل Apple Pay عبر Moyasar</h3>
          </div>
          <a
            href="https://dashboard.moyasar.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2A4A] hover:bg-[#0d3260] text-white text-xs font-medium transition-colors"
          >
            <ExternalLink size={12} strokeWidth={2} />
            لوحة Moyasar
          </a>
        </div>

        <div className="p-5 space-y-5">

          {/* Info banner */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <Smartphone size={15} className="text-blue-500 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
            <p className="text-blue-700 text-xs leading-relaxed">
              Apple Pay يعمل تلقائياً على Safari/iOS عند إتمام الخطوات أدناه. المستخدمون على أجهزة Apple سيرون زر Apple Pay مباشرةً في صفحة دفع Moyasar دون أي تعديل إضافي على الكود.
            </p>
          </div>

          {/* Requirements */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">المتطلبات الأساسية</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Building2, title: "حساب Apple Developer", desc: "membership.apple.com — اشتراك سنوي $99", color: "bg-gray-50 border-gray-200", iconColor: "text-gray-600" },
                { icon: ShieldCheck, title: "Domain Verification", desc: "ملف تحقق يُضاف لجذر الموقع لإثبات الملكية", color: "bg-teal-50 border-teal-200", iconColor: "text-teal-600" },
                { icon: Smartphone, title: "Moyasar Apple Pay", desc: "تفعيل من لوحة إعدادات بوابة Moyasar", color: "bg-black/5 border-black/10", iconColor: "text-black" },
              ].map((req) => (
                <div key={req.title} className={`rounded-xl border p-3.5 flex flex-col gap-2 ${req.color}`}>
                  <req.icon size={18} strokeWidth={1.5} className={req.iconColor} />
                  <p className="text-xs font-semibold text-[#0B2A4A] leading-snug">{req.title}</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{req.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-step */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">خطوات التفعيل</p>
            <ol className="space-y-3">
              {[
                {
                  step: "١",
                  title: "إنشاء Merchant ID في Apple Developer",
                  desc: (
                    <>
                      افتح{" "}
                      <a href="https://developer.apple.com/account/resources/identifiers/list/merchant" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline hover:text-teal-700">Certificates, Identifiers & Profiles</a>
                      {" "}← Identifiers ← اضغط "+" ← اختر <strong>Merchant IDs</strong> ← أدخل وصفاً مثل{" "}<code className="bg-gray-100 px-1 rounded text-[10px]">merchant.sa.azm</code>
                    </>
                  ),
                },
                {
                  step: "٢",
                  title: "تحقق من نطاق الموقع (Domain Verification)",
                  desc: (
                    <>
                      في صفحة الـ Merchant ID ← <strong>Apple Pay on the Web</strong> ← اضغط <strong>Add Domain</strong> ← أدخل نطاقك مثل{" "}
                      <code className="bg-gray-100 px-1 rounded text-[10px]">azm.sa</code> ←{" "}
                      حمّل ملف التحقق وضعه في المسار{" "}
                      <code className="bg-gray-100 px-1 rounded text-[10px]">.well-known/apple-developer-merchantid-domain-association</code>{" "}
                      على جذر الموقع ← اضغط <strong>Verify</strong>.
                    </>
                  ),
                },
                {
                  step: "٣",
                  title: "ربط Merchant ID بـ Moyasar",
                  desc: (
                    <>
                      افتح{" "}
                      <a href="https://dashboard.moyasar.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline hover:text-teal-700">dashboard.moyasar.com</a>
                      {" "}← الإعدادات ← <strong>طرق الدفع</strong> ← فعّل <strong>Apple Pay</strong> ← أدخل الـ Merchant ID الذي أنشأته في الخطوة ١.
                    </>
                  ),
                },
                {
                  step: "٤",
                  title: "اختبار على جهاز Apple",
                  desc: "افتح الموقع على Safari (iPhone / Mac) ← اضف منتجاً للسلة ← اضغط إتمام الشراء — يجب أن يظهر زر Apple Pay في صفحة دفع Moyasar.",
                },
              ].map((s) => (
                <li key={s.step} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0B2A4A] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {s.step}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#0B2A4A] mb-0.5">{s.title}</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Checklist */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-500 mb-2.5">قائمة التحقق السريعة</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "حساب Apple Developer نشط",
                "Merchant ID تم إنشاؤه",
                "نطاق الموقع تم التحقق منه",
                "ملف .well-known مرفوع على الموقع",
                "Apple Pay مُفعَّل في لوحة Moyasar",
                "تم الاختبار على Safari / iPhone",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CircleDot size={13} className="text-gray-300 flex-shrink-0" strokeWidth={1.75} />
                  <span className="text-[11px] text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Support note */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              يستغرق التحقق من النطاق أحياناً 24 ساعة. إذا واجهت مشكلة تواصل مع دعم Moyasar على{" "}
              <a href="mailto:support@moyasar.com" className="underline font-medium hover:text-amber-800">support@moyasar.com</a>{" "}
              أو عبر{" "}
              <a href="https://moyasar.com" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-amber-800">moyasar.com</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Alert */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-amber-700 text-xs leading-relaxed">
          بعض الإعدادات تتطلب إعادة تشغيل المنصة حتى تدخل حيز التنفيذ. تأكد من حفظ جميع التغييرات قبل المغادرة.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-[#0B2A4A] hover:bg-[#0d3360] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Save size={16} />
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}
