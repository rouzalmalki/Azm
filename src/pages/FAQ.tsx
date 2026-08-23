import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, HelpCircle, FileEdit, Package, Building2, RefreshCw, CreditCard } from "lucide-react";

const faqs = [
  {
    id: 1,
    icon: <FileEdit size={18} className="text-[#2BB6A3]" />,
    question: "هل الملفات قابلة للتعديل؟",
    answer: (
      <div className="space-y-2 text-sm text-text-secondary leading-relaxed">
        <p>
          نعم، جميع النماذج متاحة بصيغة <strong className="text-[#0B2A4A]">Word (.docx)</strong> قابلة للتعديل الكامل. يمكنك:
        </p>
        <ul className="space-y-1.5 mt-2">
          {[
            "تغيير اسم الجمعية وبياناتها الرسمية.",
            "تعديل التواريخ والأرقام والمعلومات الخاصة بمؤسستك.",
            "إضافة أو حذف بنود حسب احتياج مؤسستك.",
            "تغيير التنسيق والألوان والخطوط.",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2BB6A3] mt-1.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 mt-2">
          * صيغة PDF متاحة أيضاً للاطّلاع والطباعة فقط دون تعديل.
        </p>
      </div>
    ),
  },
  {
    id: 2,
    icon: <Package size={18} className="text-[#2BB6A3]" />,
    question: "كيف يتم استلام الملف بعد الشراء؟",
    answer: (
      <div className="space-y-2 text-sm text-text-secondary leading-relaxed">
        <p>عملية الاستلام فورية وتتم في ثلاث خطوات:</p>
        <ol className="space-y-3 mt-3">
          {[
            {
              step: "١",
              title: "أتمم الدفع عبر Stripe",
              desc: "أدخل بيانات بطاقتك الائتمانية في صفحة الدفع الآمنة.",
            },
            {
              step: "٢",
              title: "إعادة التوجيه التلقائي",
              desc: "بعد نجاح الدفع، يُعاد توجيهك فوراً لصفحة التأكيد على المنصة.",
            },
            {
              step: "٣",
              title: "تنزيل فوري",
              desc: "تُفتح أزرار تنزيل Word وPDF مباشرةً في صفحة النموذج. كما تبقى النماذج المشتراة متاحة في حسابك في أي وقت.",
            },
          ].map((item) => (
            <li key={item.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0B2A4A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.step}
              </div>
              <div>
                <p className="font-semibold text-[#0B2A4A] text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="bg-teal-50 border border-teal-100 rounded-lg px-3 py-2.5 mt-3">
          <p className="text-xs text-teal-700">
            💡 لا حاجة لإنشاء حساب لإتمام الشراء — يكفي البريد الإلكتروني أو رقم الجوال عند الدفع.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    icon: <CreditCard size={18} className="text-[#2BB6A3]" />,
    question: "ما وسائل الدفع المتاحة؟ وهل تدعمون البطاقات السعودية؟",
    answer: (
      <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
        <p>
          نعم، ندعم البطاقات البنكية السعودية المحلية والدولية عبر منصة{" "}
          <strong className="text-[#0B2A4A]">Stripe</strong>:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            {
              name: "مدى (Mada)",
              desc: "بطاقات البنوك السعودية المحلية",
              cardClass: "bg-green-50 border-green-100",
              badgeClass: "bg-green-100 text-green-700",
              textClass: "text-green-700",
            },
            {
              name: "Visa",
              desc: "بطاقات فيزا الائتمانية والمدفوعة مسبقاً",
              cardClass: "bg-blue-50 border-blue-100",
              badgeClass: "bg-blue-100 text-blue-700",
              textClass: "text-blue-700",
            },
            {
              name: "Mastercard",
              desc: "بطاقات ماستركارد الائتمانية والمدفوعة مسبقاً",
              cardClass: "bg-orange-50 border-orange-100",
              badgeClass: "bg-orange-100 text-orange-700",
              textClass: "text-orange-700",
            },
          ].map((card) => (
            <div key={card.name} className={`rounded-xl border px-3 py-2.5 ${card.cardClass}`}>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${card.badgeClass}`}>
                {card.name}
              </span>
              <p className={`text-xs leading-snug ${card.textClass}`}>{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#0B2A4A]/5 border border-[#0B2A4A]/10 rounded-xl px-4 py-3 space-y-2">
          <p className="font-semibold text-[#0B2A4A] text-xs mb-2">أمان الدفع عبر Stripe</p>
          {[
            "تشفير SSL/TLS بمعيار 256-bit لجميع بيانات الدفع.",
            "Stripe معتمدة بشهادة PCI DSS المستوى 1 — أعلى معيار أمان في الصناعة.",
            "بيانات بطاقتك لا تمرّ أو تُخزَّن على خوادم منصة عزم مطلقاً.",
            "تحقق ثنائي (3D Secure) مدعوم لزيادة أمان المعاملات.",
          ].map((item, i) => (
            <p key={i} className="flex items-start gap-2 text-xs text-[#0B2A4A]/70">
              <span className="text-[#2BB6A3] font-bold flex-shrink-0">✓</span>
              {item}
            </p>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 text-xs text-amber-700">
          💡 تأكد من تفعيل خاصية الدفع الإلكتروني على بطاقتك البنكية قبل إتمام الشراء، خاصةً لبطاقات مدى.
        </div>
      </div>
    ),
  },
  {
    id: 4,
    icon: <Building2 size={18} className="text-[#2BB6A3]" />,
    question: "هل الملفات مخصصة للقطاع غير الربحي فقط؟",
    answer: (
      <div className="space-y-2 text-sm text-text-secondary leading-relaxed">
        <p>
          نعم، منصة عزم مُصمَّمة خصيصاً لخدمة <strong className="text-[#0B2A4A]">منظمات القطاع الغير ربحي والجمعيات الأهلية</strong> في المملكة العربية السعودية. تشمل النماذج:
        </p>
        <ul className="space-y-1.5 mt-2">
          {[
            "نماذج مجالس الإدارة والجمعيات العمومية.",
            "نماذج البرامج والمشاريع الخيرية والتنموية.",
            "المراسلات الرسمية مع الجهات الحكومية (وزارة الموارد البشرية، هيئة الزكاة...).",
            "وثائق حوكمة الجمعيات وتقارير الأداء.",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2BB6A3] mt-1.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-2">
          يمكن للشركات والمؤسسات التجارية الاستفادة من النماذج العامة (المراسلات، العقود)، غير أن المحتوى موجّه في أغلبه للقطاع غير الربحي.
        </p>
      </div>
    ),
  },
  {
    id: 5,
    icon: <RefreshCw size={18} className="text-red-400" />,
    question: "هل يمكن استرجاع المبلغ أو استبدال النموذج؟",
    answer: (
      <div className="space-y-2 text-sm text-text-secondary leading-relaxed">
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <p className="font-bold text-red-600 text-sm mb-1">لا يتم استرداد المبلغ أو استبدال النموذج</p>
          <p className="text-xs text-red-500 leading-relaxed">
            نظراً لأن النماذج منتجات رقمية قابلة للتنزيل الفوري، لا يمكن استرداد المبلغ بعد إتمام الشراء وفق طبيعة المنتجات الرقمية.
          </p>
        </div>
        <p className="mt-2">لذلك ننصح بـ:</p>
        <ul className="space-y-1.5">
          {[
            "الاطّلاع على وصف النموذج بعناية قبل الشراء.",
            "التواصل معنا عبر واتساب لأي استفسار قبل الشراء.",
            "الاستفادة من الوصف التفصيلي ومعلومات الوثيقة في صفحة كل نموذج.",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 mt-2">
          <p className="text-xs text-blue-700">
            في حال وجود خطأ تقني (عدم اكتمال التنزيل، ملف تالف)، تواصل معنا خلال ٢٤ ساعة عبر{" "}
            <a href="https://wa.me/966508819116" target="_blank" rel="noopener noreferrer" className="font-bold underline">
              واتساب
            </a>{" "}
            وسنعالج المشكلة فوراً.
          </p>
        </div>
      </div>
    ),
  },
];

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => setOpenId(openId === id ? null : id);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link to="/" className="hover:text-primary-500">الرئيسية</Link>
        <ArrowRight size={14} className="rtl-flip" />
        <span className="text-text-primary">الأسئلة الشائعة</span>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-l from-[#0B2A4A] to-[#0d3260] rounded-2xl px-7 py-8 mb-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <HelpCircle size={20} className="text-white" />
          </div>
          <h1 className="font-heading font-bold text-xl">الأسئلة الشائعة</h1>
        </div>
        <p className="text-white/70 text-sm leading-relaxed">
          إجابات على أكثر الأسئلة شيوعاً حول النماذج، طريقة الاستلام، وسياسات الاستخدام.
        </p>
        <p className="text-white/40 text-xs mt-3">
          لم تجد إجابتك؟{" "}
          <a href="https://wa.me/966508819116" target="_blank" rel="noopener noreferrer" className="text-white/70 underline hover:text-white">
            تواصل معنا عبر واتساب
          </a>
        </p>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={`card transition-all duration-200 ${isOpen ? "border-[#2BB6A3]/40 shadow-sm" : "hover:border-gray-200"}`}
            >
              <button
                onClick={() => toggle(faq.id)}
                className="w-full flex items-center gap-3 text-right"
                aria-expanded={isOpen}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? "bg-teal-50" : "bg-gray-50"}`}>
                  {faq.icon}
                </div>
                <span className="flex-1 font-heading font-semibold text-[#0B2A4A] text-sm leading-snug text-right">
                  {faq.question}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#2BB6A3]" : ""}`}
                />
              </button>

              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[700px] mt-4 pt-4 border-t border-gray-100" : "max-h-0"}`}
              >
                {faq.answer}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact CTA */}
      <div className="mt-8 bg-gray-50 rounded-2xl border border-gray-100 px-6 py-6 text-center">
        <p className="font-heading font-semibold text-[#0B2A4A] mb-1">لديك سؤال آخر؟</p>
        <p className="text-sm text-gray-500 mb-4">فريقنا متاح من الساعة 4 م إلى 10 م يومياً</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/966508819116"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-green-500 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            تواصل عبر واتساب
          </a>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#0B2A4A] text-[#0B2A4A] text-sm font-semibold hover:bg-[#0B2A4A] hover:text-white transition-colors"
          >
            نموذج التواصل
          </Link>
        </div>
      </div>
    </div>
  );
}
