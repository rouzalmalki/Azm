import { Mail, Phone, Clock, MapPin, Send, MessageSquare, CheckCircle2, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  sentAt: string;
  read: boolean;
};

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    label: "البريد الإلكتروني",
    value: "info@azm.sa",
    sub: "للاستفسارات العامة والتعاون المؤسسي",
    href: "mailto:info@azm.sa",
    isLtr: true,
  },
  {
    icon: Phone,
    label: "واتساب",
    value: "0508819116",
    sub: "للأمور العاجلة والدعم الفني المباشر",
    href: "https://wa.me/966508819116",
    isLtr: true,
  },
  {
    icon: MapPin,
    label: "الموقع الجغرافي",
    value: "جدة، المملكة العربية السعودية",
    sub: "الخدمة متاحة لكافة مناطق المملكة",
    href: undefined,
    isLtr: false,
  },
  {
    icon: Clock,
    label: "ساعات العمل",
    value: "يومياً 4 م – 10 م",
    sub: "نستجيب في أقرب وقت خلال أوقات العمل",
    href: undefined,
    isLtr: false,
  },
];

const SUBJECT_OPTIONS = [
  "استفسار عن نموذج",
  "طلب نموذج جديد",
  "مشكلة في الدفع أو التنزيل",
  "اقتراح أو ملاحظة",
  "شراكة أو تعاون مؤسسي",
  "دعم فني",
  "أخرى",
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [messages, setMessages] = useLocalStorage<ContactMessage[]>("azm_messages", []);

  const errors: Partial<Record<keyof FormState, string>> = {};
  if (touched.name && !form.name.trim()) errors.name = "الاسم مطلوب";
  if (touched.email && !form.email.trim()) errors.email = "البريد الإلكتروني مطلوب";
  else if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "صيغة البريد غير صحيحة";
  if (touched.subject && !form.subject) errors.subject = "يرجى اختيار موضوع الرسالة";
  if (touched.message && form.message.trim().length < 10)
    errors.message = "الرسالة قصيرة جداً (10 أحرف على الأقل)";

  const isValid =
    form.name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.subject &&
    form.message.trim().length >= 10;

  const handleBlur = (field: keyof FormState) =>
    setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });
    if (!isValid) return;
    setLoading(true);
    setTimeout(() => {
      const newMsg: ContactMessage = {
        id: `msg-${Date.now()}`,
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
        sentAt: new Date().toISOString(),
        read: false,
      };
      setMessages([newMsg, ...messages]);
      setLoading(false);
      setSubmitted(true);
    }, 900);
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0B2A4A 0%, #0F3A60 60%, #143D5E 100%)" }}>
        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-white opacity-[0.03]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#2BB6A3] opacity-[0.05] translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={26} className="text-[#2BB6A3]" strokeWidth={1.5} />
            </div>
            <div className="text-center sm:text-right">
              <span className="inline-block bg-[#2BB6A3]/20 border border-[#2BB6A3]/40 text-[#2BB6A3] text-xs font-medium px-3 py-1 rounded-full mb-3">
                نحن هنا للمساعدة
              </span>
              <h1 className="font-heading font-bold text-white text-3xl sm:text-4xl lg:text-5xl leading-tight mb-3">
                تواصل مع <span className="text-[#2BB6A3]">فريق عزم</span>
              </h1>
              <p className="text-white/70 text-base leading-relaxed max-w-xl">
                سواء كان لديك استفسار عن النماذج، أو تحتاج دعماً فنياً، أو تودّ اقتراح محتوى جديد — نحن نرحب بتواصلك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Channels Strip ── */}
      <section className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-x-reverse divide-border">
            {CONTACT_CHANNELS.map((ch) => (
              <div key={ch.label} className="py-6 px-4 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-1">
                  <ch.icon size={19} className="text-[#2BB6A3]" strokeWidth={1.75} />
                </div>
                <p className="text-[11px] text-text-secondary font-medium">{ch.label}</p>
                {ch.href ? (
                  <a
                    href={ch.href}
                    target={ch.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="font-heading font-semibold text-sm text-[#0B2A4A] hover:text-[#2BB6A3] transition-colors"
                    dir={ch.isLtr ? "ltr" : "rtl"}>
                    {ch.value}
                  </a>
                ) : (
                  <p className="font-heading font-semibold text-sm text-[#0B2A4A]">{ch.value}</p>
                )}
                <p className="text-[11px] text-text-secondary leading-snug hidden lg:block">{ch.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-5 gap-7">

          {/* ── Sidebar Info ── */}
          <aside className="lg:col-span-2 space-y-5">

            {/* Response Card */}
            <div
              className="rounded-2xl p-6 text-white relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0B2A4A 0%, #0F3A60 100%)" }}>
              <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-[#2BB6A3] opacity-10 -translate-x-1/2 -translate-y-1/2" />
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                  <Clock size={17} className="text-[#2BB6A3]" strokeWidth={1.75} />
                </div>
                <h3 className="font-heading font-bold text-base mb-2">وقت الاستجابة</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  نسعى للرد خلال ساعات عمل المنصة. للأمور العاجلة تواصل مباشرة عبر واتساب.
                </p>
                <a
                  href="https://wa.me/966508819116"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#2BB6A3] hover:bg-[#249e8d] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  <Phone size={14} strokeWidth={2} />
                  تواصل عبر واتساب
                </a>
              </div>
            </div>

            {/* FAQ teaser */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm mb-3">قبل أن ترسل رسالتك</h3>
              <p className="text-text-secondary text-xs leading-relaxed mb-4">
                ربما تجد إجابة لاستفسارك في صفحة الأسئلة الشائعة.
              </p>
              <Link
                to="/faq"
                className="flex items-center gap-2 text-[#2BB6A3] text-xs font-semibold hover:underline">
                <ChevronLeft size={14} strokeWidth={2} />
                تصفّح الأسئلة الشائعة
              </Link>
            </div>

            {/* Topics we help with */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm mb-3">نساعدك في</h3>
              <ul className="space-y-2.5">
                {[
                  "استفسارات عن محتوى النماذج",
                  "مشاكل الدفع والتنزيل",
                  "طلب إضافة نماذج جديدة",
                  "الشراكات والتعاون المؤسسي",
                  "الدعم الفني للمنصة",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-text-secondary">
                    <CheckCircle2 size={13} className="text-[#2BB6A3] mt-0.5 flex-shrink-0" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ── Contact Form ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Form header */}
              <div
                className="px-7 py-5 flex items-center gap-3"
                style={{ background: "linear-gradient(to left, #0B2A4A, #0F3A60)" }}>
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Send size={16} className="text-[#2BB6A3]" strokeWidth={1.75} />
                </div>
                <h2 className="font-heading font-bold text-white text-base">أرسل لنا رسالة</h2>
              </div>

              {submitted ? (
                /* ── Success State ── */
                <div className="px-7 py-14 text-center">
                  <div className="w-16 h-16 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={32} className="text-[#2BB6A3]" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-heading font-bold text-[#0B2A4A] text-xl mb-2">
                    تم إرسال رسالتك بنجاح!
                  </h3>
                  <p className="text-text-secondary text-sm max-w-xs mx-auto leading-relaxed mb-7">
                    شكراً لتواصلك مع فريق عزم. سنقوم بالرد عليك في أقرب وقت ممكن خلال ساعات العمل.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm(EMPTY_FORM);
                      setTouched({});
                    }}
                    className="inline-flex items-center gap-2 bg-[#0B2A4A] hover:bg-[#0d3360] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
                    <Send size={14} strokeWidth={2} />
                    إرسال رسالة جديدة
                  </button>
                </div>
              ) : (
                /* ── Form ── */
                <form onSubmit={handleSubmit} noValidate className="px-7 py-7 space-y-5">

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0B2A4A] mb-1.5">
                      الاسم الكامل <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      onBlur={() => handleBlur("name")}
                      placeholder="محمد العمري"
                      className={`w-full border rounded-lg px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none transition-all ${
                        errors.name
                          ? "border-red-300 focus:border-red-400"
                          : "border-border focus:border-teal-400"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-[11px] mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email + Phone */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0B2A4A] mb-1.5">
                        البريد الإلكتروني <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        onBlur={() => handleBlur("email")}
                        placeholder="example@email.com"
                        dir="ltr"
                        className={`w-full border rounded-lg px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none transition-all ${
                          errors.email
                            ? "border-red-300 focus:border-red-400"
                            : "border-border focus:border-teal-400"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0B2A4A] mb-1.5">
                        رقم الجوال <span className="text-text-secondary font-normal">(اختياري)</span>
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="05xxxxxxxx"
                        dir="ltr"
                        className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-teal-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Subject dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0B2A4A] mb-1.5">
                      موضوع الرسالة <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      onBlur={() => handleBlur("subject")}
                      className={`w-full border rounded-lg px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none transition-all appearance-none ${
                        errors.subject
                          ? "border-red-300 focus:border-red-400"
                          : "border-border focus:border-teal-400"
                      } ${!form.subject ? "text-gray-400" : "text-[#0B2A4A]"}`}>
                      <option value="" disabled>اختر موضوع الرسالة...</option>
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    {errors.subject && (
                      <p className="text-red-400 text-[11px] mt-1">{errors.subject}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0B2A4A] mb-1.5">
                      نص الرسالة <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      onBlur={() => handleBlur("message")}
                      placeholder="اكتب رسالتك هنا بتفصيل كافٍ حتى نتمكن من مساعدتك..."
                      rows={5}
                      className={`w-full border rounded-lg px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none transition-all resize-none ${
                        errors.message
                          ? "border-red-300 focus:border-red-400"
                          : "border-border focus:border-teal-400"
                      }`}
                    />
                    <div className="flex items-center justify-between mt-1">
                      {errors.message ? (
                        <p className="text-red-400 text-[11px]">{errors.message}</p>
                      ) : (
                        <span />
                      )}
                      <span className={`text-[11px] ${form.message.length > 280 ? "text-amber-500" : "text-text-secondary"}`}>
                        {form.message.length}/300
                      </span>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0B2A4A] hover:bg-[#0d3360] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors">
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جارٍ الإرسال...
                      </>
                    ) : (
                      <>
                        <Send size={15} strokeWidth={2} />
                        إرسال الرسالة
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-text-secondary">
                    بإرسال هذه الرسالة توافق على{" "}
                    <Link to="/privacy" className="text-[#2BB6A3] hover:underline">سياسة الخصوصية</Link>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
