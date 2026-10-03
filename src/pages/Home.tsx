import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Users, Building2, BarChart3, Landmark, ArrowLeft, Shield, ChevronLeft } from "lucide-react";
import SearchBar from "@/components/features/SearchBar";
import CategoryGrid from "@/components/features/CategoryGrid";
import StatsBar from "@/components/features/StatsBar";
import TemplateCard from "@/components/features/TemplateCard";
import { CATEGORIES, TEMPLATES, STATS } from "@/constants/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { SavedTemplate, DownloadRecord } from "@/types";
import heroBg from "@/assets/hero-bg.jpg";

export default function Home() {
  const navigate = useNavigate();
  const [savedTemplates, setSavedTemplates] = useLocalStorage<SavedTemplate[]>(
    "azm_saved",
    []
  );
  const [downloads, setDownloads] = useLocalStorage<DownloadRecord[]>(
    "azm_downloads",
    []
  );

  const featuredTemplates = TEMPLATES.filter((t) => t.isFeatured).slice(0, 4);

  const isSaved = (id: string) => savedTemplates.some((s) => s.templateId === id);

  const handleToggleSave = (id: string) => {
    if (isSaved(id)) {
      setSavedTemplates(savedTemplates.filter((s) => s.templateId !== id));
    } else {
      setSavedTemplates([
      ...savedTemplates,
      { templateId: id, savedAt: new Date().toISOString() }]
      );
    }
  };

  const handleDownload = (id: string, format: "word" | "pdf") => {
    const tpl = TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    const record: DownloadRecord = {
      templateId: id,
      templateTitle: tpl.title,
      date: new Date().toISOString(),
      format
    };
    setDownloads([record, ...downloads]);
    console.log(`Downloading ${tpl.title} as ${format}`);
  };

  const handleDownloadBoth = (id: string) => {
    const tpl = TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    const now = new Date().toISOString();
    setDownloads([
    { templateId: id, templateTitle: tpl.title, date: now, format: "word" },
    { templateId: id, templateTitle: tpl.title, date: now, format: "pdf" },
    ...downloads]
    );
  };

  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0B2A4A 0%, #0F3A60 60%, #143D5E 100%)"
        }}>
        
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }} />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="inline-block mb-4">
            <span className="bg-teal text-white text-xs font-medium px-3 py-1 rounded-full tracking-wide">
              مكتبة الوثائق الرسمية
            </span>
          </div>
          <h1 className="font-heading font-bold text-white text-3xl sm:text-5xl lg:text-6xl mb-4 leading-[1.4] sm:leading-[1.35] lg:leading-[1.2]">
            نماذج رسمية
            <br className="block" />
            <span className="text-[#2BB6A3] mt-2 inline-block">للجمعيات الأهلية</span>
          </h1>
          <p className="text-primary-200 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            أكثر من 30 نموذجاً وخطاباً رسمياً جاهزاً للتنزيل والتعديل لمنظمات القطاع غير الربحي — من محاضر الاجتماعات إلى اللوائح والسياسات والخطابات الرسمية.
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar
              size="large"
              navigateOnSearch
              placeholder="ابحث: محضر اجتماع، خطاب تعريف، لائحة داخلية..." />
            
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <StatsBar
          templates={STATS.templates}
          downloads={STATS.downloads}
          associations={STATS.associations} />
        
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">تصفّح حسب التصنيف</h2>
            <p className="section-subtitle !mb-0">
              8 تصنيفات تغطي كامل دورة عمل الجمعية
            </p>
          </div>
          <button
            onClick={() => navigate("/library")}
            className="text-teal text-sm font-medium hover:underline hidden sm:block">
            
            عرض الكل
          </button>
        </div>
        <CategoryGrid categories={CATEGORIES} />
      </section>

      {/* Governance Section */}
      <section className="relative overflow-hidden mt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B2A4A] via-[#0d3260] to-[#0f3a72]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #2BB6A3 0%, transparent 50%), radial-gradient(circle at 80% 20%, #2BB6A3 0%, transparent 40%)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#2BB6A3]/20 border border-[#2BB6A3]/30 rounded-full px-3.5 py-1.5 mb-4">
                <Shield size={13} strokeWidth={2} className="text-[#2BB6A3]" />
                <span className="text-[#2BB6A3] text-xs font-semibold">منظومة الحوكمة</span>
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white leading-snug">
                حوكمة مصمّمة لكل حجم
              </h2>
              <p className="text-white/50 text-sm mt-2 leading-relaxed max-w-xl">
                اختر فئة جمعيتك واحصل على النماذج والوثائق الملائمة لاحتياجات الحوكمة تلقائياً
              </p>
            </div>
            <Link
              to="/governance"
              className="flex items-center gap-1.5 text-[#2BB6A3] text-sm font-semibold hover:text-teal-300 transition-colors flex-shrink-0"
            >
              <span>استعراض الحوكمة كاملاً</span>
              <ArrowLeft size={14} strokeWidth={2.5} className="rotate-180" />
            </Link>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              {
                to: "/governance/micro",
                label: "المتناهية الصغر",
                sublabel: "Micro",
                icon: Users,
                color: "#2BB6A3",
                memberRange: "أقل من 30 عضواً",
                budget: "< 100K ريال",
                docCount: 4,
                desc: "جمعيات ناشئة تحتاج هياكل حوكمة مبسّطة وفعّالة.",
                gradient: "from-teal-500/10 to-teal-600/5",
                border: "border-teal-500/20 hover:border-teal-400/40",
              },
              {
                to: "/governance/small",
                label: "الصغيرة",
                sublabel: "Small",
                icon: Building2,
                color: "#60A5FA",
                memberRange: "30 – 100 عضو",
                budget: "100K – 500K",
                docCount: 5,
                desc: "هيكل تنظيمي واضح يتطلب أدوات حوكمة متوسطة التعقيد.",
                gradient: "from-blue-500/10 to-blue-600/5",
                border: "border-blue-500/20 hover:border-blue-400/40",
              },
              {
                to: "/governance/medium",
                label: "المتوسطة",
                sublabel: "Medium",
                icon: BarChart3,
                color: "#A78BFA",
                memberRange: "100 – 500 عضو",
                budget: "500K – 5M",
                docCount: 6,
                desc: "وحدات إدارية متعددة تستوجب منظومة حوكمة متكاملة.",
                gradient: "from-purple-500/10 to-purple-600/5",
                border: "border-purple-500/20 hover:border-purple-400/40",
              },
              {
                to: "/governance/large",
                label: "الكبيرة",
                sublabel: "Large",
                icon: Landmark,
                color: "#FBB041",
                memberRange: "أكثر من 500 عضو",
                budget: "5M+ ريال",
                docCount: 7,
                desc: "أعلى معايير الحوكمة والرقابة والشفافية للمؤسسات الراسخة.",
                gradient: "from-amber-500/10 to-amber-600/5",
                border: "border-amber-500/20 hover:border-amber-400/40",
              },
            ] as const).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group relative bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20`}
                >
                  {/* Icon + sublabel */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: item.color + '18', border: `1.5px solid ${item.color}30` }}
                    >
                      <Icon size={20} strokeWidth={1.5} style={{ color: item.color }} />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: item.color + 'CC' }}>
                      {item.sublabel}
                    </span>
                  </div>

                  {/* Label + description */}
                  <div>
                    <h3 className="font-heading font-bold text-white text-base leading-snug mb-1.5">
                      الجمعيات {item.label}
                    </h3>
                    <p className="text-white/45 text-[11px] leading-relaxed">{item.desc}</p>
                  </div>

                  {/* Stats row */}
                  <div className="mt-auto pt-3 border-t border-white/8 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/35 mb-0.5">الأعضاء</p>
                      <p className="text-xs font-semibold text-white/70">{item.memberRange}</p>
                    </div>
                    <div
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: item.color, backgroundColor: item.color + '18' }}
                    >
                      {item.docCount} وثائق
                    </div>
                  </div>

                  {/* CTA row */}
                  <div
                    className="flex items-center gap-1 text-[11px] font-semibold transition-all duration-150 opacity-60 group-hover:opacity-100"
                    style={{ color: item.color }}
                  >
                    <span>تصفّح النماذج</span>
                    <ChevronLeft size={12} strokeWidth={2.5} className="rotate-180" />
                  </div>

                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 0 1px ${item.color}30` }}
                  />
                </Link>
              );
            })}
          </div>

          {/* Bottom CTA bar */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <Link
              to="/governance"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/8 border border-white/12 text-white/70 text-xs font-semibold hover:bg-white/12 hover:text-white/90 transition-all"
            >
              <Shield size={13} strokeWidth={2} className="text-[#2BB6A3]" />
              استعراض نظرة عامة على منظومة الحوكمة
            </Link>
            <div className="flex-1 h-px bg-white/8" />
          </div>
        </div>
      </section>

      {/* Featured Templates */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">النماذج الأكثر استخداماً</h2>
            <p className="section-subtitle !mb-0">
              النماذج التي تحتاجها كل جمعية في عملها اليومي
            </p>
          </div>
          <button
            onClick={() => navigate("/library")}
            className="text-teal text-sm font-medium hover:underline hidden sm:block">
            
            المكتبة الكاملة
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredTemplates.map((tpl) =>
          <TemplateCard
            key={tpl.id}
            template={tpl}
            isSaved={isSaved(tpl.id)}
            onToggleSave={handleToggleSave}
            onDownload={handleDownload}
            onDownloadBoth={handleDownloadBoth} />

          )}
        </div>
        <div className="text-center mt-8">
          <button onClick={() => navigate("/library")} className="btn-primary">
            استعراض جميع النماذج
          </button>
        </div>
      </section>
    </div>
  );
}
