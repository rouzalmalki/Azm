import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, AlertTriangle, Lock, FileText, Scale } from "lucide-react";

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link to="/" className="hover:text-primary-500">الرئيسية</Link>
        <ArrowRight size={14} className="rtl-flip" />
        <span className="text-text-primary">شروط الاستخدام</span>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-l from-[#0B2A4A] to-[#0d3260] rounded-2xl px-7 py-8 mb-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Scale size={20} className="text-white" />
          </div>
          <h1 className="font-heading font-bold text-xl">شروط الاستخدام</h1>
        </div>
        <p className="text-white/70 text-sm leading-relaxed">
          عند شراء أي نموذج من منصة عزم، أنت توافق على الشروط التالية. يُرجى قراءتها بعناية قبل إتمام الشراء.
        </p>
        <p className="text-white/40 text-xs mt-3">
          آخر تحديث: أغسطس ٢٠٢٦
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-5">

        {/* Allowed */}
        <div className="card border-emerald-100">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={16} className="text-emerald-600" />
            </div>
            <h2 className="font-heading font-bold text-base text-[#0B2A4A]">ما يُسمح به</h2>
          </div>
          <ul className="space-y-2.5 text-sm text-text-secondary">
            {[
              "استخدام النموذج داخل مؤسستك أو جمعيتك الأهلية للأغراض الرسمية.",
              "تعديل النموذج وتخصيصه ليتناسب مع بيانات ونشاط جمعيتك.",
              "طباعة النموذج للاستخدام الورقي الداخلي.",
              "مشاركته داخلياً مع أعضاء الفريق ضمن نفس المؤسسة.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Prohibited */}
        <div className="card border-red-100 bg-red-50/30">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={16} className="text-red-500" />
            </div>
            <h2 className="font-heading font-bold text-base text-[#0B2A4A]">ما يُحظر تمامًا</h2>
          </div>
          <ul className="space-y-2.5 text-sm text-text-secondary">
            {[
              "إعادة بيع النموذج أو تأجيره أو تسعيره لأطراف أخرى تحت أي مسمى.",
              "نشر النموذج على الإنترنت أو وسائل التواصل الاجتماعي أو أي منصة عامة.",
              "توزيع النموذج أو إرساله كملف لأشخاص من خارج مؤسستك.",
              "استخدامه لإنشاء منتجات تنافسية أو قوالب مشتقة لبيعها.",
              "ادعاء ملكية المحتوى أو حذف العلامات التجارية المرتبطة به.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Scope */}
        <div className="card border-blue-100 bg-blue-50/30">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-blue-600" />
            </div>
            <h2 className="font-heading font-bold text-base text-[#0B2A4A]">نطاق الترخيص</h2>
          </div>
          <div className="space-y-3 text-sm text-text-secondary leading-relaxed">

            <p>
              في حال احتاجت مؤسسات متعددة لاستخدام نفس النموذج، يتطلب ذلك شراءً منفصلاً لكل مؤسسة.
            </p>
            <p>
              جميع حقوق الملكية الفكرية للنماذج محفوظة لمنصة عزم وفق نظام الملكية الفكرية في المملكة العربية السعودية.
            </p>
          </div>
        </div>

        {/* Privacy & Data */}
        <div className="card">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#e8f4f8] flex items-center justify-center flex-shrink-0">
              <Lock size={16} className="text-[#2BB6A3]" />
            </div>
            <h2 className="font-heading font-bold text-base text-[#0B2A4A]">الخصوصية والبيانات</h2>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            بيانات المشتري (البريد الإلكتروني، معلومات الدفع) تُعالَج بشكل آمن عبر Stripe ولا تُخزَّن على خوادمنا. لا نشارك بياناتك مع أي طرف ثالث بخلاف معالج الدفع.
          </p>
        </div>

        {/* Legal */}
        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 px-5 py-4 text-xs text-gray-400 leading-relaxed">
          <p className="font-semibold text-gray-500 mb-1.5">إخلاء مسؤولية قانوني</p>
          <p>
            تُقدَّم النماذج "كما هي" وتمثّل مرجعاً احترافياً مقترحاً. لا تُشكّل النماذج استشارة قانونية، ولا تتحمل منصة عزم المسؤولية عن أي نتائج تترتب على استخدامها دون مراجعة مختص قانوني عند الحاجة.
          </p>
        </div>

      </div>

      {/* Back CTA */}
      <div className="text-center mt-8">
        <Link
          to="/library"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B2A4A] text-white text-sm font-semibold hover:bg-[#0d3260] transition-colors"
        >
          <ArrowRight size={15} className="rtl-flip" />
          تصفّح المكتبة
        </Link>
      </div>
    </div>
  );
}
