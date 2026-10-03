import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown, Users, Building2, FolderKanban, Target, Zap, BarChart2, CheckCircle2, RefreshCw, AlertCircle, Cloud, Shield, ArrowRight } from "lucide-react";
import SearchBar from "@/components/features/SearchBar";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";
import TemplateCard from "@/components/features/TemplateCard";
import { CATEGORIES, DOCUMENT_TYPES, TARGET_ENTITIES } from "@/constants/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTemplates } from "@/hooks/useTemplates";
import type { SavedTemplate, DownloadRecord, TemplateCategory, DocumentType, TargetEntity } from "@/types";

// ─── Meetings Sections Sub-component ───────────────────────────────────────
interface MeetingsSectionsProps {
  filtered: import("@/types").Template[];
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  onDownload: (id: string, format: "word" | "pdf") => void;
}

function MeetingsSections({ filtered, isSaved, onToggleSave, onDownload }: MeetingsSectionsProps) {
  const isGaExtraordinary = (t: import("@/types").Template) =>
    t.targetEntity === "الجمعية_العمومية" &&
    (t.title.includes("غير العادي") || t.title.includes("غير عادي"));

  const boardAll = filtered.filter((t) => t.targetEntity === "مجلس_الإدارة");
  const gaRegular = filtered.filter(
    (t) => t.targetEntity === "الجمعية_العمومية" && !isGaExtraordinary(t)
  );
  const gaExtraordinary = filtered.filter((t) => isGaExtraordinary(t));

  const others = filtered.filter(
    (t) => t.targetEntity !== "مجلس_الإدارة" && t.targetEntity !== "الجمعية_العمومية"
  );

  const renderCardGrid = (items: import("@/types").Template[]) => (
    <div className="grid grid-cols-1 gap-4">
      {items.map((tpl) => (
        <TemplateCard
          key={tpl.id}
          template={tpl}
          isSaved={isSaved(tpl.id)}
          onToggleSave={onToggleSave}
          onDownload={onDownload}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* ── مجلس الإدارة (جميع المحاضر) ── */}
        {boardAll.length > 0 && (
          <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 bg-blue-50 border-b border-blue-100">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-100">
                <Building2 size={17} strokeWidth={1.75} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-base text-[#0B2A4A]">مجلس الإدارة</h2>
                <p className="text-xs text-text-muted mt-0.5">{boardAll.length} نماذج</p>
              </div>
            </div>
            <div className="p-4">{renderCardGrid(boardAll)}</div>
          </div>
        )}

        {/* ── الجمعية العمومية (عادية + غير عادية) ── */}
        {(gaRegular.length > 0 || gaExtraordinary.length > 0) && (
          <div className="bg-white border border-teal-100 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 bg-teal-50 border-b border-teal-100">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-teal-100">
                <Users size={17} strokeWidth={1.75} className="text-teal-600" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-base text-[#0B2A4A]">الجمعية العمومية</h2>
                <p className="text-xs text-text-muted mt-0.5">{gaRegular.length + gaExtraordinary.length} نماذج</p>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {gaRegular.length > 0 && (
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full mb-3 block w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    الاجتماعات العادية
                  </span>
                  {renderCardGrid(gaRegular)}
                </div>
              )}
              {gaRegular.length > 0 && gaExtraordinary.length > 0 && (
                <div className="border-t border-dashed border-teal-100" />
              )}
              {gaExtraordinary.length > 0 && (
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full mb-3 block w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                    الاجتماعات غير العادية
                  </span>
                  {renderCardGrid(gaExtraordinary)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {others.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-gray-200">
            <div>
              <h2 className="font-heading font-bold text-lg text-[#0B2A4A]">وثائق أخرى</h2>
              <p className="text-xs text-text-muted mt-0.5">{others.length} نماذج</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {others.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                isSaved={isSaved(tpl.id)}
                onToggleSave={onToggleSave}
                onDownload={onDownload}
              />
            ))}
          </div>
        </div>
      )}
      <ScrollToTopButton />
    </div>
  );
}

// ─── Project Lifecycle Stages ────────────────────────────────────────────────

type ProjectStage = "all" | "planning" | "execution" | "monitoring" | "closure";

const PROJECT_STAGES: { id: ProjectStage; label: string; icon: React.ElementType; color: string; activeColor: string; templateIds: string[] }[] = [
  {
    id: "all",
    label: "جميع المراحل",
    icon: FolderKanban,
    color: "border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-600",
    activeColor: "border-orange-400 bg-orange-50 text-orange-700 font-semibold",
    templateIds: [],
  },
  {
    id: "planning",
    label: "التخطيط",
    icon: Target,
    color: "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600",
    activeColor: "border-blue-400 bg-blue-50 text-blue-700 font-semibold",
    templateIds: ["tpl-101", "tpl-102", "tpl-103"],
  },
  {
    id: "execution",
    label: "التنفيذ",
    icon: Zap,
    color: "border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:text-teal-600",
    activeColor: "border-teal-400 bg-teal-50 text-teal-700 font-semibold",
    templateIds: ["tpl-102", "tpl-104"],
  },
  {
    id: "monitoring",
    label: "المتابعة والرصد",
    icon: BarChart2,
    color: "border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:text-violet-600",
    activeColor: "border-violet-400 bg-violet-50 text-violet-700 font-semibold",
    templateIds: ["tpl-104", "tpl-106"],
  },
  {
    id: "closure",
    label: "الإغلاق والتقييم",
    icon: CheckCircle2,
    color: "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-600",
    activeColor: "border-emerald-400 bg-emerald-50 text-emerald-700 font-semibold",
    templateIds: ["tpl-105", "tpl-106"],
  },
];

interface ProjectsSectionsProps {
  filtered: import("@/types").Template[];
  projectStage: ProjectStage;
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  onDownload: (id: string, format: "word" | "pdf") => void;
  onStageChange: (stage: ProjectStage) => void;
}

// ─── Ordered lifecycle stages (excludes "all") ───────────────────────────────
const ORDERED_STAGES: { id: Exclude<ProjectStage, "all">; label: string; shortLabel: string; icon: React.ElementType; color: string; activeColor: string; dotColor: string; lineColor: string; templateIds: string[] }[] = [
  {
    id: "planning",
    label: "التخطيط",
    shortLabel: "التخطيط",
    icon: Target,
    color: "text-gray-400",
    activeColor: "text-blue-600",
    dotColor: "bg-blue-500",
    lineColor: "bg-blue-300",
    templateIds: ["tpl-101", "tpl-102", "tpl-103"],
  },
  {
    id: "execution",
    label: "التنفيذ",
    shortLabel: "التنفيذ",
    icon: Zap,
    color: "text-gray-400",
    activeColor: "text-teal-600",
    dotColor: "bg-teal-500",
    lineColor: "bg-teal-300",
    templateIds: ["tpl-102", "tpl-104"],
  },
  {
    id: "monitoring",
    label: "المتابعة",
    shortLabel: "المتابعة",
    icon: BarChart2,
    color: "text-gray-400",
    activeColor: "text-violet-600",
    dotColor: "bg-violet-500",
    lineColor: "bg-violet-300",
    templateIds: ["tpl-104", "tpl-106"],
  },
  {
    id: "closure",
    label: "الإغلاق",
    shortLabel: "الإغلاق",
    icon: CheckCircle2,
    color: "text-gray-400",
    activeColor: "text-emerald-600",
    dotColor: "bg-emerald-500",
    lineColor: "bg-emerald-300",
    templateIds: ["tpl-105", "tpl-106"],
  },
];

function ProjectsSections({ filtered, projectStage, isSaved, onToggleSave, onDownload, onStageChange }: ProjectsSectionsProps) {
  const stageFiltered = projectStage === "all"
    ? filtered
    : filtered.filter((t) => PROJECT_STAGES.find((s) => s.id === projectStage)?.templateIds.includes(t.id));

  const currentStage = PROJECT_STAGES.find((s) => s.id === projectStage);

  const activeIndex = ORDERED_STAGES.findIndex((s) => s.id === projectStage);

  return (
    <div className="space-y-5">

      {/* ── Visual Progress Stepper ── */}
      <div className="bg-white border border-orange-100 rounded-2xl p-5">
        <p className="text-xs font-semibold text-gray-400 mb-5">مراحل دورة حياة المشروع</p>

        {/* Stepper row */}
        <div className="relative flex items-start justify-between">

          {/* Full-width background line */}
          <div className="absolute top-5 right-[calc(12.5%)] left-[calc(12.5%)] h-0.5 bg-gray-200 -translate-y-1/2 pointer-events-none" />

          {ORDERED_STAGES.map((stage, idx) => {
            const isActive = projectStage === stage.id;
            const isPast = activeIndex !== -1 && idx < activeIndex;
            const Icon = stage.icon;
            const count = filtered.filter((t) => stage.templateIds.includes(t.id)).length;

            return (
              <div key={stage.id} className="relative flex flex-col items-center flex-1">

                {/* Circle button */}
                <button
                  onClick={() => onStageChange(isActive ? "all" : stage.id)}
                  className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 mb-2 shadow-sm
                    ${isActive
                      ? `${stage.dotColor} border-transparent text-white shadow-md scale-110`
                      : isPast
                        ? `${stage.dotColor} border-transparent text-white opacity-70`
                        : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                >
                  {isPast ? (
                    <CheckCircle2 size={18} strokeWidth={2} />
                  ) : (
                    <Icon size={17} strokeWidth={isActive ? 2 : 1.75} />
                  )}
                  {/* Stage number badge */}
                  <span
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center border border-white
                      ${isActive ? "bg-white text-gray-700" : isPast ? "bg-white text-gray-500" : "bg-gray-100 text-gray-400"}`}
                  >
                    {idx + 1}
                  </span>
                </button>

                {/* Label + count */}
                <div className="text-center px-1">
                  <p className={`text-xs font-semibold leading-tight transition-colors ${isActive ? stage.activeColor : isPast ? "text-gray-500" : "text-gray-400"}`}>
                    {stage.shortLabel}
                  </p>
                  <span className={`text-[10px] mt-0.5 inline-block px-1.5 py-0.5 rounded-full ${isActive ? `${stage.dotColor} text-white` : "bg-gray-100 text-gray-400"}`}>
                    {count} نماذج
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* "All stages" toggle */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => onStageChange("all")}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              projectStage === "all"
                ? "border-orange-300 bg-orange-50 text-orange-600 font-semibold"
                : "border-gray-200 text-gray-400 hover:border-orange-200 hover:text-orange-500"
            }`}
          >
            <FolderKanban size={13} strokeWidth={1.75} />
            عرض جميع المراحل
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${projectStage === "all" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"}`}>
              {filtered.length}
            </span>
          </button>

          {projectStage !== "all" && currentStage && (
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${
                projectStage === "planning" ? "bg-blue-500" :
                projectStage === "execution" ? "bg-teal-500" :
                projectStage === "monitoring" ? "bg-violet-500" : "bg-emerald-500"
              }`} />
              <span className="text-xs text-gray-400">
                {projectStage === "planning" && "وثيقة التأسيس · خطة العمل · طلب التمويل"}
                {projectStage === "execution" && "خطة العمل التفصيلية · تقرير المتابعة"}
                {projectStage === "monitoring" && "تقرير الرصد الميداني · استبيان الرضا"}
                {projectStage === "closure" && "التقرير الختامي · استبيان الرضا"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      {stageFiltered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stageFiltered.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              isSaved={isSaved(tpl.id)}
              onToggleSave={onToggleSave}
              onDownload={onDownload}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-14 bg-white rounded-xl border border-dashed border-orange-200">
          <p className="text-gray-400 text-sm">لا توجد نماذج في هذه المرحلة ضمن الفلاتر الحالية</p>
        </div>
      )}
      <ScrollToTopButton />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { id: "newest", label: "الأحدث" },
  { id: "mostDownloaded", label: "الأكثر تنزيلاً" },
  { id: "rating", label: "الأعلى تقييماً" },
];

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ── Merged templates (DB + static) ───────────────────────────────────────
  const { templates: ALL_TEMPLATES, loading: templatesLoading, error: templatesError, refresh } = useTemplates();

  const governanceSize = searchParams.get("governance") || "";
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState<TemplateCategory | "all">(
    (searchParams.get("category") as TemplateCategory) || "all"
  );

  // Sync state when URL changes (e.g. navigating from governance page)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = (searchParams.get("category") as TemplateCategory) || "all";
    setSearch(q);
    setCategory(cat);
  }, [searchParams]);
  const [docType, setDocType] = useState<DocumentType | "all">("all");
  const [targetEntity, setTargetEntity] = useState<TargetEntity | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "mostDownloaded" | "rating">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [projectStage, setProjectStage] = useState<ProjectStage>("all");

  const [savedTemplates, setSavedTemplates] = useLocalStorage<SavedTemplate[]>("azm_saved", []);
  const [downloads, setDownloads] = useLocalStorage<DownloadRecord[]>("azm_downloads", []);

  const isSaved = (id: string) => savedTemplates.some((s) => s.templateId === id);

  const handleToggleSave = (id: string) => {
    if (isSaved(id)) {
      setSavedTemplates(savedTemplates.filter((s) => s.templateId !== id));
    } else {
      setSavedTemplates([...savedTemplates, { templateId: id, savedAt: new Date().toISOString() }]);
    }
  };

  const handleDownload = (id: string, format: "word" | "pdf") => {
    const tpl = ALL_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;

    // If the template has a real URL, open it
    const url = format === "word" ? tpl.wordUrl : tpl.pdfUrl;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }

    setDownloads([
      { templateId: id, templateTitle: tpl.title, date: new Date().toISOString(), format },
      ...downloads,
    ]);
    console.log(`Download: ${tpl.title} [${format}]${url ? " → " + url : " (no file)"}`);
  };

  const filtered = useMemo(() => {
    let list = [...ALL_TEMPLATES];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.includes(q) ||
          t.description.includes(q) ||
          t.tags.some((tag) => tag.includes(q))
      );
    }
    if (category !== "all") list = list.filter((t) => t.category === category);
    if (docType !== "all") list = list.filter((t) => t.documentType === docType);
    if (targetEntity !== "all") list = list.filter((t) => t.targetEntity === targetEntity);

    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    } else if (sortBy === "mostDownloaded") {
      list.sort((a, b) => b.downloads - a.downloads);
    } else {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [search, category, docType, targetEntity, sortBy, ALL_TEMPLATES]);

  const activeFilterCount = [
    category !== "all",
    docType !== "all",
    targetEntity !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setCategory("all");
    setDocType("all");
    setTargetEntity("all");
    setSortBy("newest");
    setSearch("");
    setProjectStage("all");
    setSearchParams({});
  };

  const GOVERNANCE_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
    micro:  { label: "الجمعيات المتناهية الصغر", color: "#2BB6A3", bg: "bg-teal-50",   border: "border-teal-200"  },
    small:  { label: "الجمعيات الصغيرة",          color: "#0B2A4A", bg: "bg-blue-50",   border: "border-blue-200"  },
    medium: { label: "الجمعيات المتوسطة",          color: "#7C3AED", bg: "bg-purple-50", border: "border-purple-200" },
    large:  { label: "الجمعيات الكبيرة",           color: "#B45309", bg: "bg-amber-50",  border: "border-amber-200"  },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-primary-500 mb-2">
            مكتبة النماذج
          </h1>
          <p className="text-text-secondary text-base flex items-center gap-2">
            {templatesLoading ? (
              <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                <RefreshCw size={13} className="animate-spin" />
                جارٍ تحميل النماذج...
              </span>
            ) : (
              <>
                <span>{ALL_TEMPLATES.length} نموذج ووثيقة رسمية</span>
                <span className="flex items-center gap-1 text-xs text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                  <Cloud size={11} />
                  مزامن مع Cloud
                </span>
              </>
            )}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={templatesLoading}
          title="تحديث النماذج"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 text-xs transition-all disabled:opacity-40 self-start sm:self-auto"
        >
          <RefreshCw size={13} className={templatesLoading ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>

      {/* ── Governance filter banner ── */}
      {governanceSize && GOVERNANCE_LABELS[governanceSize] && (
        <div
          className={`flex items-center gap-3 ${GOVERNANCE_LABELS[governanceSize].bg} border ${GOVERNANCE_LABELS[governanceSize].border} rounded-xl px-4 py-3 mb-5`}
        >
          <Shield size={16} strokeWidth={1.75} style={{ color: GOVERNANCE_LABELS[governanceSize].color }} className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: GOVERNANCE_LABELS[governanceSize].color }}>
              نتائج مفلترة لـ: {GOVERNANCE_LABELS[governanceSize].label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              تعرض النماذج المتعلقة باحتياجات الحوكمة لهذه الفئة — يمكنك تعديل الفلاتر أو مسحها لعرض المكتبة كاملة.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to={`/governance/${governanceSize}`}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
              style={{ borderColor: GOVERNANCE_LABELS[governanceSize].color + "50", color: GOVERNANCE_LABELS[governanceSize].color }}
            >
              <ArrowRight size={11} strokeWidth={2} />
              العودة للحوكمة
            </Link>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 rounded-lg hover:bg-white/60 transition-colors"
            >
              <X size={13} strokeWidth={2} />
              مسح
            </button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {templatesError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">
          <AlertCircle size={15} />
          <span>تعذّر تحميل النماذج من قاعدة البيانات — يتم عرض النماذج الثابتة فقط.</span>
          <button onClick={refresh} className="mr-auto text-red-500 hover:text-red-600 underline text-xs">إعادة المحاولة</button>
        </div>
      )}

      {/* ── Sticky Search + Filter Bar ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-3 pb-3 border-b border-border shadow-sm mb-4">

        {/* Search */}
        <div className="mb-3">
          <SearchBar
            initialValue={search}
            onSearch={setSearch}
            placeholder="ابحث في المكتبة..."
          />
        </div>

        {/* Filter Toggle + Sort */}
        <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
            showFilters || activeFilterCount > 0
              ? "border-teal-300 bg-teal-50 text-[#2BB6A3]"
              : "border-border bg-white text-text-secondary hover:border-primary-300"
          }`}
        >
          <SlidersHorizontal size={15} strokeWidth={1.75} />
          فلاتر
          {activeFilterCount > 0 && (
            <span className="bg-teal text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="appearance-none bg-white border border-border rounded-md pr-3 pl-8 py-2 text-sm text-text-secondary hover:border-primary-300 focus:outline-none focus:border-teal-400 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
          >
            <X size={14} />
            مسح الفلاتر
          </button>
        )}

          <span className="mr-auto text-sm text-text-muted">
            {filtered.length} نموذج
          </span>
        </div>

      </div>{/* end sticky wrapper */}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-border rounded-lg p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              التصنيف
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="input-field py-2 text-sm"
            >
              <option value="all">جميع التصنيفات</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              نوع الوثيقة
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as typeof docType)}
              className="input-field py-2 text-sm"
            >
              {DOCUMENT_TYPES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              الجهة المستقبِلة
            </label>
            <select
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value as typeof targetEntity)}
              className="input-field py-2 text-sm"
            >
              {TARGET_ENTITIES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {(category !== "all" || docType !== "all" || targetEntity !== "all") && (
        <div className="flex flex-wrap gap-2 mb-4">
          {category !== "all" && (
            <span className="badge-teal flex items-center gap-1">
              {CATEGORIES.find((c) => c.id === category)?.label}
              <button onClick={() => setCategory("all")} className="hover:opacity-70">
                <X size={12} />
              </button>
            </span>
          )}
          {docType !== "all" && (
            <span className="badge-teal flex items-center gap-1">
              {DOCUMENT_TYPES.find((d) => d.id === docType)?.label}
              <button onClick={() => setDocType("all")} className="hover:opacity-70">
                <X size={12} />
              </button>
            </span>
          )}
          {targetEntity !== "all" && (
            <span className="badge-teal flex items-center gap-1">
              {TARGET_ENTITIES.find((t) => t.id === targetEntity)?.label}
              <button onClick={() => setTargetEntity("all")} className="hover:opacity-70">
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results Grid */}
      {filtered.length > 0 ? (
        category === "إدارة_الاجتماعات" ? (
          <MeetingsSections
            filtered={filtered}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onDownload={handleDownload}
          />
        ) : category === "البرامج_والمشاريع" ? (
          <ProjectsSections
            filtered={filtered}
            projectStage={projectStage}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onDownload={handleDownload}
            onStageChange={setProjectStage}
          />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              isSaved={isSaved(tpl.id)}
              onToggleSave={handleToggleSave}
              onDownload={handleDownload}
            />
          ))}
        </div>
        )
      ) : (
        <div className="text-center py-20 bg-white rounded-lg border border-border">
          <p className="text-text-muted text-lg mb-2">لا توجد نتائج مطابقة</p>
          <p className="text-text-muted text-sm mb-4">جرّب تعديل البحث أو مسح الفلاتر</p>
          <button onClick={clearFilters} className="btn-teal">
            مسح الفلاتر
          </button>
        </div>
      )}
      <ScrollToTopButton />
    </div>
  );
}
