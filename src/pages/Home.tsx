import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
