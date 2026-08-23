import { Eye, Target, Flag, BookOpen, Users, Award, TrendingUp, ShieldCheck, Handshake, Lightbulb, Clock, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";

const STATS = [
  { value: "+31", label: "نموذجاً رسمياً", icon: BookOpen },
  { value: "+100", label: "جمعية مستفيدة", icon: Users },
  { value: "+200", label: "عملية تنزيل", icon: TrendingUp },
  { value: "9", label: "تصنيفات متخصصة", icon: Award },
];

const VISION_POINTS = [
  {
    icon: ShieldCheck,
    title: "توحيد المرجعية الإدارية",
    desc: "بناء بنك معرفي شامل وموحّد لكافة الخطابات والوثائق الرسمية التي تحتاجها الجمعيات في مكان واحد.",
  },
  {
    icon: Clock,
    title: "رفع الكفاءة التشغيلية",
    desc: "تقليص الوقت والجهد المستهلَك في صياغة المعاملات والسياسات من الصفر، عبر قوالب جاهزة للتعديل الفوري.",
  },
  {
    icon: Flag,
    title: "تعزيز الحوكمة والامتثال",
    desc: "ضمان توافق خطابات وتقارير الجمعيات مع اشتراطات معايير الحوكمة واللوائح الصادرة عن الجهات التشريعية.",
  },
  {
    icon: Globe,
    title: "تحسين جودة الاتصال المؤسسي",
    desc: "تمكين الجمعيات من مخاطبة الجهات المانحة والحكومية بلغة رسمية ورصينة تعزز فرص قبول طلباتها.",
  },
  {
    icon: Handshake,
    title: "إثراء المعرفة التشاركية",
    desc: "خلق بيئة لتبادل الخبرات الإدارية بين الجمعيات عبر مراجعة وإتاحة النماذج الناجحة للجميع.",
  },
];

const GOALS = [
  {
    num: "01",
    title: "بنك معرفي شامل",
    desc: "توفير مكتبة متكاملة من النماذج والوثائق لجميع أنواع الجمعيات الأهلية في مكان واحد.",
    color: "border-teal-400",
  },
  {
    num: "02",
    title: "توفير الوقت والجهد",
    desc: "قوالب جاهزة للتعديل الفوري تقلّص زمن صياغة المعاملات والسياسات بشكل ملحوظ.",
    color: "border-blue-400",
  },
  {
    num: "03",
    title: "تعزيز الحوكمة",
    desc: "توافق تام مع معايير الحوكمة واللوائح التشريعية الصادرة عن الجهات الإشرافية.",
    color: "border-indigo-400",
  },
  {
    num: "04",
    title: "رفع جودة الاتصال",
    desc: "لغة مؤسسية رسمية ورصينة تعزز مصداقية الجمعية أمام المانحين والجهات الحكومية.",
    color: "border-violet-400",
  },
  {
    num: "05",
    title: "بيئة معرفية تشاركية",
    desc: "تبادل الخبرات الإدارية وإتاحة النماذج الناجحة لجميع الجمعيات دون استثناء.",
    color: "border-amber-400",
  },
  {
    num: "06",
    title: "دعم المنظمات الناشئة",
    desc: "تمكين الجمعيات الصغيرة من بناء بنية إدارية راسخة تحقق الاستدامة المؤسسية.",
    color: "border-rose-400",
  },
];

export default function About() {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0B2A4A 0%, #0F3A60 60%, #143D5E 100%)" }}>
        {/* Decorative circles */}
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-white opacity-[0.03]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#2BB6A3] opacity-[0.05] translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Logo pill */}
            <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-lg">
              <img src={logo} alt="شعار عزم" className="w-14 h-14 object-contain" />
            </div>

            <div className="text-center sm:text-right">
              <span className="inline-block bg-[#2BB6A3]/20 border border-[#2BB6A3]/40 text-[#2BB6A3] text-xs font-medium px-3 py-1 rounded-full mb-3">
                منصة القطاع غير الربحي
              </span>
              <h1 className="font-heading font-bold text-white text-3xl sm:text-4xl lg:text-5xl leading-tight mb-3">
                عن منصة <span className="text-[#2BB6A3]">عزم</span>
              </h1>
              <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl">
                منصة متخصصة في توفير النماذج والخطابات الرسمية المعتمدة لمنظمات المجتمع المدني والجمعيات الأهلية في المملكة العربية السعودية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-x-reverse divide-border">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center gap-2 py-7 px-4 text-center">
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-1">
                  <s.icon size={20} className="text-[#2BB6A3]" strokeWidth={1.75} />
                </div>
                <span className="font-heading font-bold text-2xl text-[#0B2A4A]">{s.value}</span>
                <span className="text-xs text-text-secondary leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">

        {/* ── Mission ── */}
        <section id="mission" className="scroll-mt-24">
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Section header bar */}
            <div className="bg-gradient-to-l from-[#0B2A4A] to-[#0F3A60] px-7 py-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Target size={18} className="text-[#2BB6A3]" strokeWidth={1.75} />
              </div>
              <h2 className="font-heading font-bold text-white text-xl">الرسالة</h2>
            </div>
            <div className="px-7 py-8">
              <blockquote className="border-r-4 border-[#2BB6A3] pr-6">
                <p className="text-text-primary text-base leading-[1.9] font-medium">
                  تمكين المنظمات والجمعيات الأهلية في القطاع غير الربحي عبر إتاحة بنك معرفي مفتوح للوثائق والخطابات المفرغة، وتوفير أدوات صياغة سريعة واحترافية تسهم في توفير الوقت والجهد، وترفع من مستوى الحوكمة والكفاءة الإدارية لتسهيل بناء الشراكات وجلب الاستدامة.
                </p>
              </blockquote>
              <div className="mt-6 flex flex-wrap gap-2">
                {["توفير الوقت", "رفع الكفاءة", "الحوكمة المؤسسية", "الاستدامة", "بناء الشراكات"].map(tag => (
                  <span key={tag} className="bg-teal-50 text-[#2BB6A3] border border-teal-200 text-xs font-medium px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Vision ── */}
        <section id="vision" className="scroll-mt-24">
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-l from-[#1a5c52] to-[#2BB6A3] px-7 py-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Eye size={18} className="text-white" strokeWidth={1.75} />
              </div>
              <h2 className="font-heading font-bold text-white text-xl">الرؤية</h2>
            </div>
            <div className="px-7 py-8">
              <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                نسعى إلى بناء منظومة وثائقية متكاملة تُرسّخ الاحتراف الإداري في الجمعيات الأهلية وتمنحها أدوات تنافسية مؤسسية.
              </p>
              <div className="space-y-4">
                {VISION_POINTS.map((vp, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-teal-200 hover:bg-teal-50/40 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#2BB6A3] transition-colors">
                      <vp.icon size={18} className="text-[#2BB6A3] group-hover:text-white transition-colors" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0B2A4A] text-sm mb-1">{vp.title}</p>
                      <p className="text-text-secondary text-xs leading-relaxed">{vp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Goals ── */}
        <section id="goals" className="scroll-mt-24">
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-l from-[#3b1f5e] to-[#5a3285] px-7 py-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Lightbulb size={18} className="text-yellow-300" strokeWidth={1.75} />
              </div>
              <h2 className="font-heading font-bold text-white text-xl">الأهداف الاستراتيجية</h2>
            </div>
            <div className="px-7 py-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {GOALS.map((g) => (
                  <div
                    key={g.num}
                    className={`relative border-r-4 ${g.color} bg-gray-50 rounded-xl p-5 hover:shadow-md transition-shadow`}>
                    <span className="absolute top-4 left-4 font-heading font-bold text-3xl text-gray-100 leading-none select-none">
                      {g.num}
                    </span>
                    <p className="font-heading font-bold text-[#0B2A4A] text-sm mb-2 relative z-10">{g.title}</p>
                    <p className="text-text-secondary text-xs leading-relaxed relative z-10">{g.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-gradient-to-l from-[#0B2A4A] to-[#0F3A60] rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-[#2BB6A3] opacity-10 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white opacity-[0.03] translate-x-1/3 translate-y-1/3" />
          <div className="relative">
            <h3 className="font-heading font-bold text-white text-2xl sm:text-3xl mb-3">
              ابدأ بتنزيل أول نموذج الآن
            </h3>
            <p className="text-white/60 text-sm mb-7 max-w-md mx-auto leading-relaxed">
              أكثر من 30 نموذجاً وخطاباً رسمياً جاهزاً للتعديل والتنزيل — وفّر وقتك وارفع مستوى جمعيتك.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/library"
                className="inline-flex items-center justify-center gap-2 bg-[#2BB6A3] hover:bg-[#249e8d] text-white font-semibold px-7 py-3 rounded-lg transition-colors text-sm">
                <BookOpen size={17} strokeWidth={1.75} />
                تصفح المكتبة
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-7 py-3 rounded-lg transition-colors text-sm">
                تواصل معنا
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
