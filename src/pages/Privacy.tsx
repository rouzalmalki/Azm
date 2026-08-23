import { Link } from "react-router-dom";
import { ArrowRight, Shield } from "lucide-react";

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link to="/" className="hover:text-primary-500">الرئيسية</Link>
        <ArrowRight size={14} className="rtl-flip" />
        <span className="text-text-primary">سياسة الخصوصية</span>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-l from-[#0B2A4A] to-[#0d3260] rounded-2xl px-7 py-8 mb-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <h1 className="font-heading font-bold text-xl">سياسة الخصوصية</h1>
        </div>
        <p className="text-white/70 text-sm leading-relaxed">
          نلتزم في منصة عزم بحماية خصوصيتك والحفاظ على بياناتك الشخصية. توضّح هذه السياسة ما نجمعه، وكيف نستخدمه، وحقوقك الكاملة تجاهه.
        </p>
        <p className="text-white/40 text-xs mt-3">آخر تحديث: أغسطس ٢٠٢٦</p>
      </div>

      {/* Back CTA */}
      <div className="text-center mt-4">
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
