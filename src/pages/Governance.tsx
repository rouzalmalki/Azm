import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  Landmark,
  BarChart3,
  FileText,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  Shield,
  BookOpen,
} from "lucide-react";

// تعريف أحجام الجمعيات
const SIZES = {
  micro: {
    key: "micro",
    label: "الجمعيات المتناهية الصغر",
    shortLabel: "متناهية الصغر",
    icon: Users,
    color: "#2BB6A3",
    bg: "from-teal-50 to-emerald-50",
    border: "border-teal-200",
    badge: "bg-teal-100 text-teal-700",
    description: "جمعيات ناشئة بأعضاء أقل من 30 شخصاً وميزانية محدودة تحتاج إلى هياكل حوكمة مبسّطة وفعّالة.",
    memberRange: "أقل من 30 عضواً",
    budgetRange: "أقل من 100,000 ريال",
    // روابط المكتبة المفلترة
    librarySearch: "نظام أساسي",
    libraryCategory: "اللوائح_والسياسات",
    features: [
      "نظام أساسي مبسّط",
      "محضر اجتماع الجمعية العمومية",
      "قوائم مالية مختصرة",
      "سجل العضوية الأساسي",
      "تقرير النشاط السنوي",
    ],
    docs: [
      { title: "النظام الأساسي للجمعية المتناهية الصغر", category: "حوكمة", search: "نظام أساسي" },
      { title: "محضر الاجتماع التأسيسي", category: "وثائق الاجتماعات", search: "محضر" },
      { title: "نموذج طلب العضوية", category: "إدارية", search: "عضوية" },
      { title: "تقرير النشاط السنوي المبسّط", category: "تقارير", search: "تقرير سنوي" },
    ],
  },
  small: {
    key: "small",
    label: "الجمعيات الصغيرة",
    shortLabel: "الصغيرة",
    icon: Building2,
    color: "#0B2A4A",
    bg: "from-blue-50 to-indigo-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    description: "جمعيات ذات هيكل تنظيمي واضح، بعضوية تتراوح بين 30 و100 شخص، وتحتاج إلى أدوات حوكمة متوسطة التعقيد.",
    memberRange: "30 – 100 عضو",
    budgetRange: "100,000 – 500,000 ريال",
    librarySearch: "",
    libraryCategory: "اللوائح_والسياسات",
    features: [
      "نظام أساسي تفصيلي",
      "لائحة مجلس الإدارة",
      "سياسة التضارب في المصالح",
      "نماذج القوائم المالية الكاملة",
      "خطة العمل السنوية",
      "لائحة الموارد البشرية",
    ],
    docs: [
      { title: "النظام الأساسي للجمعية الصغيرة", category: "حوكمة", search: "نظام أساسي" },
      { title: "لائحة مجلس الإدارة", category: "حوكمة", search: "مجلس الإدارة" },
      { title: "خطة العمل السنوية", category: "تخطيط", search: "خطة العمل" },
      { title: "سياسة الإفصاح والشفافية", category: "سياسات", search: "لائحة داخلية" },
      { title: "تقرير التدقيق الداخلي", category: "مالية", search: "تقرير" },
    ],
  },
  medium: {
    key: "medium",
    label: "الجمعيات المتوسطة",
    shortLabel: "المتوسطة",
    icon: BarChart3,
    color: "#7C3AED",
    bg: "from-purple-50 to-violet-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    description: "جمعيات راسخة بعضوية بين 100 و500 شخص، تمتلك وحدات إدارية متعددة وتحتاج إلى منظومة حوكمة متكاملة.",
    memberRange: "100 – 500 عضو",
    budgetRange: "500,000 – 5,000,000 ريال",
    librarySearch: "حوكمة",
    libraryCategory: "اللوائح_والسياسات",
    features: [
      "منظومة لوائح داخلية متكاملة",
      "سياسة إدارة المخاطر",
      "هيكل الرقابة الداخلية",
      "دليل الإجراءات التشغيلية",
      "لائحة المشتريات والعقود",
      "خطة التواصل المؤسسي",
      "تقييم الأداء المؤسسي",
    ],
    docs: [
      { title: "دليل الحوكمة المؤسسية", category: "حوكمة", search: "حوكمة" },
      { title: "سياسة إدارة المخاطر", category: "سياسات", search: "لائحة" },
      { title: "لائحة المشتريات والعقود", category: "مالية", search: "مشتريات" },
      { title: "خطة الاتصال المؤسسي", category: "تواصل", search: "خطة" },
      { title: "تقرير التدقيق الخارجي", category: "مالية", search: "تقرير" },
      { title: "نموذج تقييم الأداء المؤسسي", category: "تقارير", search: "تقييم" },
    ],
  },
  large: {
    key: "large",
    label: "الجمعيات الكبيرة",
    shortLabel: "الكبيرة",
    icon: Landmark,
    color: "#B45309",
    bg: "from-amber-50 to-orange-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    description: "جمعيات راسخة بعضوية تتجاوز 500 شخص، وهياكل تنفيذية معقدة تستوجب أعلى معايير الحوكمة والرقابة والشفافية.",
    memberRange: "أكثر من 500 عضو",
    budgetRange: "أكثر من 5,000,000 ريال",
    librarySearch: "تضارب المصالح",
    libraryCategory: "اللوائح_والسياسات",
    features: [
      "دليل الحوكمة الشامل",
      "لجان متخصصة (تدقيق، مخاطر، مكافآت)",
      "منظومة الامتثال والرقابة",
      "سياسة العلاقات مع أصحاب المصلحة",
      "إطار إدارة الاستدامة",
      "تقرير الأثر الاجتماعي",
      "آلية التظلم والشكاوى",
      "دليل التوجيه للأعضاء الجدد",
    ],
    docs: [
      { title: "دليل الحوكمة الشامل للجمعيات الكبيرة", category: "حوكمة", search: "حوكمة" },
      { title: "لائحة لجنة التدقيق", category: "حوكمة", search: "لائحة" },
      { title: "إطار إدارة الاستدامة", category: "استراتيجية", search: "لائحة داخلية" },
      { title: "تقرير الأثر الاجتماعي", category: "تقارير", search: "تقرير سنوي" },
      { title: "سياسة الامتثال والمساءلة", category: "سياسات", search: "تضارب المصالح" },
      { title: "خطة الخلافة والاستمرارية", category: "استراتيجية", search: "لائحة" },
      { title: "آلية التظلم والشكاوى", category: "إدارية", search: "نموذج" },
    ],
  },
};

type SizeKey = keyof typeof SIZES;

// Helper — build library URL with governance filters
function buildLibraryUrl(sizeKey: string, docSearch?: string): string {
  const data = SIZES[sizeKey as SizeKey];
  if (!data) return "/library";
  const params = new URLSearchParams();
  const q = docSearch ?? data.librarySearch;
  if (q) params.set("q", q);
  if (data.libraryCategory) params.set("category", data.libraryCategory);
  params.set("governance", sizeKey);
  return `/library?${params.toString()}`;
}

export default function Governance() {
  const { size } = useParams<{ size?: string }>();
  const navigate = useNavigate();

  // If no size param — show overview landing
  if (!size || !(size in SIZES)) {
    return <GovernanceLanding />;
  }

  const data = SIZES[size as SizeKey];
  const Icon = data.icon;

  const handleBrowseLibrary = (docSearch?: string) => {
    navigate(buildLibraryUrl(size, docSearch));
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-[#2BB6A3] transition-colors">الرئيسية</Link>
          <ChevronLeft size={12} strokeWidth={1.75} className="rotate-180" />
          <Link to="/governance" className="hover:text-[#2BB6A3] transition-colors">الحوكمة</Link>
          <ChevronLeft size={12} strokeWidth={1.75} className="rotate-180" />
          <span className="text-[#0B2A4A] font-medium">{data.label}</span>
        </div>
      </div>

      {/* Hero */}
      <div className={`bg-gradient-to-br ${data.bg} border-b ${data.border}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
              style={{ backgroundColor: data.color + "18", border: `2px solid ${data.color}30` }}
            >
              <Icon size={30} strokeWidth={1.5} style={{ color: data.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0B2A4A]">
                  {data.label}
                </h1>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${data.badge}`}>
                  {data.memberRange}
                </span>
              </div>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-2xl">
                {data.description}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                الميزانية التقديرية: <span className="font-semibold">{data.budgetRange}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Features + CTA */}
        <div className="lg:col-span-1 space-y-5">
          {/* Governance elements */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Shield size={15} strokeWidth={1.75} style={{ color: data.color }} />
              <h3 className="font-heading font-semibold text-sm text-[#0B2A4A]">عناصر الحوكمة المطلوبة</h3>
            </div>
            <ul className="p-4 space-y-2">
              {data.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 size={14} strokeWidth={2} style={{ color: data.color }} className="flex-shrink-0" />
                  <span className="text-sm text-gray-600">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA to library */}
          <div
            className="rounded-2xl p-5 text-white"
            style={{ background: `linear-gradient(135deg, ${data.color} 0%, ${data.color}CC 100%)` }}
          >
            <BookOpen size={22} strokeWidth={1.5} className="mb-3 opacity-80" />
            <h3 className="font-heading font-bold text-base mb-1.5">تصفّح النماذج المتعلقة</h3>
            <p className="text-white/70 text-xs leading-relaxed mb-4">
              اعثر على جميع النماذج والوثائق المخصصة لهذا النوع من الجمعيات في مكتبة عزم — مع تصفية تلقائية.
            </p>
            <button
              onClick={() => handleBrowseLibrary()}
              className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <ArrowLeft size={13} strokeWidth={2} className="rotate-180" />
              تصفّح المكتبة مع فلتر تلقائي
            </button>
          </div>
        </div>

        {/* Right — Document templates */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={15} strokeWidth={1.75} style={{ color: data.color }} />
                <h3 className="font-heading font-semibold text-sm text-[#0B2A4A]">
                  النماذج والوثائق الموصى بها
                </h3>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full">
                {data.docs.length} وثيقة
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {data.docs.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: data.color + "15" }}
                  >
                    <FileText size={16} strokeWidth={1.5} style={{ color: data.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0B2A4A] truncate">{doc.title}</p>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${data.badge}`}
                    >
                      {doc.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleBrowseLibrary(doc.search)}
                    className="flex-shrink-0 flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors opacity-0 group-hover:opacity-100"
                    style={{ borderColor: data.color + "40", color: data.color }}
                  >
                    البحث
                    <ArrowLeft size={11} strokeWidth={2} className="rotate-180" />
                  </button>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => handleBrowseLibrary()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors"
                style={{
                  borderColor: data.color,
                  color: data.color,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = data.color;
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = data.color;
                }}
              >
                <BookOpen size={15} strokeWidth={2} />
                عرض جميع النماذج في المكتبة
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Other sizes */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="font-heading font-bold text-base text-[#0B2A4A] mb-4">أحجام الجمعيات الأخرى</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.values(SIZES)
            .filter((s) => s.key !== size)
            .map((s) => {
              const SIcon = s.icon;
              return (
                <button
                  key={s.key}
                  onClick={() => navigate(`/governance/${s.key}`)}
                  className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-gray-300 hover:shadow-sm transition-all text-right"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: s.color + "15" }}
                  >
                    <SIcon size={17} strokeWidth={1.5} style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0B2A4A]">{s.shortLabel}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.memberRange}</p>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ── Landing page (overview) ──────────────────────────────────────────────────
function GovernanceLanding() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0B2A4A] to-[#1a4a7a] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-5">
            <Shield size={30} strokeWidth={1.5} className="text-[#2BB6A3]" />
          </div>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl mb-3">حوكمة الجمعيات</h1>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            منظومة متكاملة من الوثائق والنماذج والأطر المرجعية لتمكين الجمعيات غير الربحية على اختلاف أحجامها من تطبيق أفضل معايير الحوكمة والشفافية.
          </p>
        </div>
      </div>

      {/* Size cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="font-heading font-bold text-xl text-[#0B2A4A] mb-2 text-center">اختر حجم جمعيتك</h2>
        <p className="text-gray-400 text-sm text-center mb-8">
          كل مرحلة تتطلب أدوات حوكمة مختلفة — اختر الفئة المناسبة للحصول على الوثائق والنماذج الملائمة.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {Object.values(SIZES).map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.key}
                to={`/governance/${s.key}`}
                className={`group bg-gradient-to-br ${s.bg} border ${s.border} rounded-2xl p-6 hover:shadow-md transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: s.color + "20" }}
                  >
                    <Icon size={24} strokeWidth={1.5} style={{ color: s.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-base text-[#0B2A4A] mb-1">{s.label}</h3>
                    <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">{s.description}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${s.badge}`}>
                        {s.memberRange}
                      </span>
                      <span className="text-[11px] text-gray-400">{s.budgetRange}</span>
                    </div>
                  </div>
                  <ChevronLeft
                    size={16}
                    strokeWidth={2}
                    className="text-gray-300 group-hover:text-gray-500 rotate-180 transition-colors flex-shrink-0 mt-1"
                  />
                </div>
                <div className="mt-4 pt-3 border-t border-black/5">
                  <p className="text-[11px] text-gray-400">
                    <span className="font-semibold" style={{ color: s.color }}>{s.docs.length} وثيقة </span>
                    متاحة في هذه الفئة
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
