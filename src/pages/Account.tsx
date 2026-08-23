import { useState } from "react";
import { User, Bookmark, Download, Edit3, Save, X, Building2, FileText, ShoppingBag, ExternalLink, FileDown, Search, ArrowDownUp, LogOut, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePurchased } from "@/hooks/usePurchased";
import { useTemplates } from "@/hooks/useTemplates";
import { TEMPLATES } from "@/constants/data";
import { useAuth } from "@/hooks/useAuth";
import PhoneLogin from "@/components/features/PhoneLogin";
import type { SavedTemplate, DownloadRecord, UserProfile } from "@/types";

const DEFAULT_PROFILE: UserProfile = {
  name: "أحمد بن سالم العمري",
  associationName: "جمعية تنمية أحياء الشمال",
  licenseNumber: "1234-أ",
  city: "الرياض",
  email: "info@tanmia-shamal.org.sa",
  phone: "0112345678",
};

type Tab = "saved" | "downloads" | "purchases" | "profile";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "saved", label: "المحفوظات", icon: Bookmark },
  { id: "downloads", label: "سجل التنزيل", icon: Download },
  { id: "purchases", label: "مشترياتي", icon: ShoppingBag },
  { id: "profile", label: "بيانات الجمعية", icon: Building2 },
];

export default function Account() {
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("saved");
  const [savedTemplates] = useLocalStorage<SavedTemplate[]>("azm_saved", []);
  const [downloads] = useLocalStorage<DownloadRecord[]>("azm_downloads", []);
  const [profile, setProfile] = useLocalStorage<UserProfile>("azm_profile", DEFAULT_PROFILE);
  const { purchased } = usePurchased();
  const { templates: allTemplates } = useTemplates();
  const [editing, setEditing] = useState(false);
  const [draftProfile, setDraftProfile] = useState<UserProfile>(profile);
  const [downloadAllConfirm, setDownloadAllConfirm] = useState<"pdf" | "word" | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "alpha">("newest");

  const handleExportPDF = () => {
    const purchasedList = Object.entries(purchased)
      .sort((a, b) => new Date(b[1].purchasedAt).getTime() - new Date(a[1].purchasedAt).getTime())
      .map(([templateId, entry]) => ({
        templateId,
        entry,
        tpl: allTemplates.find((t) => t.id === templateId) || TEMPLATES.find((t) => t.id === templateId),
      }));

    const totalAmount = purchasedList.length * 10;
    const printDate = new Date().toLocaleString("ar-SA", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    const rows = purchasedList.map((item, i) => {
      const date = new Date(item.entry.purchasedAt).toLocaleString("ar-SA", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
      const pdfLink = item.tpl?.pdfUrl
        ? `<a href="${item.tpl.pdfUrl}" style="color:#2BB6A3;text-decoration:none;font-weight:600;">PDF ↓</a>`
        : "—";
      const wordLink = item.tpl?.wordUrl
        ? `<a href="${item.tpl.wordUrl}" style="color:#0B2A4A;text-decoration:none;font-weight:600;">Word ↓</a>`
        : "—";
      const category = item.tpl?.category.replace(/_/g, " ") ?? "—";
      const title = item.tpl?.title ?? item.templateId;
      return `
        <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#ffffff"};">
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#0B2A4A;">${title}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#6b7280;">${category}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#374151;">${date}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;">${pdfLink}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;">${wordLink}</td>
        </tr>
      `;
    }).join("");

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>سجل المشتريات — منصة عزم</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'IBM Plex Sans Arabic', Arial, sans-serif; direction: rtl; color: #1f2937; background: #ffffff; padding: 32px; font-size: 14px; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0B2A4A; padding-bottom: 18px; margin-bottom: 24px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-dot { width: 44px; height: 44px; background: linear-gradient(135deg, #0B2A4A, #2BB6A3); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: 700; }
    .brand-name { font-size: 22px; font-weight: 700; color: #0B2A4A; }
    .brand-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .doc-meta { text-align: left; }
    .doc-title { font-size: 16px; font-weight: 700; color: #0B2A4A; }
    .doc-date { font-size: 12px; color: #6b7280; margin-top: 3px; }
    .info-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .info-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 16px; }
    .info-label { font-size: 11px; color: #9ca3af; margin-bottom: 3px; }
    .info-value { font-size: 15px; font-weight: 700; color: #0B2A4A; }
    .info-value.teal { color: #2BB6A3; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; margin-bottom: 24px; }
    thead tr { background: #0B2A4A; }
    thead th { padding: 11px 14px; text-align: right; color: #ffffff; font-size: 12px; font-weight: 600; }
    thead th:nth-child(4), thead th:nth-child(5) { text-align: center; }
    .footer { border-top: 1px solid #e5e7eb; padding-top: 14px; display: flex; align-items: center; justify-content: space-between; }
    .footer-note { font-size: 11px; color: #9ca3af; }
    .total-badge { background: #0B2A4A; color: white; padding: 6px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; }
    @media print { body { padding: 20px; } button { display: none !important; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="brand-dot">ع</div>
      <div><div class="brand-name">منصة عزم</div><div class="brand-sub">للجمعيات الأهلية</div></div>
    </div>
    <div class="doc-meta">
      <div class="doc-title">سجل المشتريات</div>
      <div class="doc-date">تاريخ الإصدار: ${printDate}</div>
    </div>
  </div>
  <div class="info-bar">
    <div class="info-card"><div class="info-label">اسم المسؤول</div><div class="info-value">${profile.name}</div></div>
    <div class="info-card"><div class="info-label">الجمعية</div><div class="info-value">${profile.associationName}</div></div>
    <div class="info-card"><div class="info-label">عدد النماذج المشتراة</div><div class="info-value teal">${purchasedList.length} نموذج</div></div>
  </div>
  <table>
    <thead><tr><th>اسم النموذج</th><th>الفئة</th><th>تاريخ الشراء</th><th>PDF</th><th>Word</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    <div class="footer-note">منصة عزم · جميع الحقوق محفوظة</div>
    <div class="total-badge">الإجمالي: ${totalAmount.toLocaleString("ar-SA")} ر.س</div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  const savedTpls = savedTemplates
    .map((s) => TEMPLATES.find((t) => t.id === s.templateId))
    .filter(Boolean);

  const handleSaveProfile = () => {
    setProfile(draftProfile);
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraftProfile(profile);
    setEditing(false);
  };

  // ── Auth guard ───────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0B2A4A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <PhoneLogin />;
  }

  // ── Authenticated view ────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <User size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-heading font-bold text-xl text-primary-500">{profile.name}</h1>
          <p className="text-text-secondary text-sm">{profile.associationName}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="badge-navy text-xs">رقم الترخيص: {profile.licenseNumber}</span>
            <span className="flex items-center gap-1 text-xs text-text-muted bg-gray-50 border border-border rounded-full px-2.5 py-0.5" dir="ltr">
              <Phone size={11} strokeWidth={2} />
              {user.phone}
            </span>
          </div>
        </div>
        <button
          onClick={async () => { await logout(); }}
          title="تسجيل الخروج"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-text-muted hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors text-sm flex-shrink-0"
        >
          <LogOut size={15} strokeWidth={1.75} />
          <span className="hidden sm:inline">خروج</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-teal text-[#2BB6A3]"
                : "border-transparent text-text-secondary hover:text-primary-500"
            }`}
          >
            <tab.icon size={15} strokeWidth={1.75} />
            {tab.label}
            {tab.id === "purchases" && Object.keys(purchased).length > 0 && (
              <span className="bg-teal-50 text-xs w-5 h-5 rounded-full flex items-center justify-center" style={{ color: '#2BB6A3' }}>
                {Object.keys(purchased).length}
              </span>
            )}
            {tab.id === "saved" && savedTemplates.length > 0 && (
              <span className="bg-primary-100 text-primary-500 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {savedTemplates.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Saved ── */}
      {activeTab === "saved" && (
        <div>
          <h2 className="section-title text-lg">النماذج المحفوظة</h2>
          {savedTpls.length === 0 ? (
            <EmptyState message="لا توجد نماذج محفوظة" sub="انتقل إلى المكتبة واحفظ النماذج التي تحتاجها" ctaLabel="استعراض المكتبة" ctaTo="/library" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedTpls.map((tpl) => tpl && (
                <Link key={tpl.id} to={`/template/${tpl.id}`} className="card-hover flex gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-md flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-primary-400" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading font-semibold text-sm text-primary-500 leading-tight mb-1 line-clamp-1">{tpl.title}</p>
                    <p className="text-text-muted text-xs">{tpl.category.replace(/_/g, " ")} · {tpl.pageCount} صفحة</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Downloads ── */}
      {activeTab === "downloads" && (
        <div>
          <h2 className="section-title text-lg">سجل التنزيلات</h2>
          {downloads.length === 0 ? (
            <EmptyState message="لا توجد تنزيلات سابقة" sub="قم بتنزيل النماذج من المكتبة" ctaLabel="استعراض المكتبة" ctaTo="/library" />
          ) : (
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              {downloads.slice(0, 20).map((dl, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold ${dl.format === "pdf" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                      {dl.format.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{dl.templateTitle}</p>
                      <p className="text-xs text-text-muted">{new Date(dl.date).toLocaleString("ar-SA")}</p>
                    </div>
                  </div>
                  <Link to={`/template/${dl.templateId}`} className="text-teal text-xs hover:underline flex-shrink-0">عرض</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Purchases ── */}
      {activeTab === "purchases" && (() => {
        const purchasedList = Object.entries(purchased)
          .map(([templateId, entry]) => ({
            templateId, entry,
            tpl: allTemplates.find((t) => t.id === templateId) || TEMPLATES.find((t) => t.id === templateId),
          }))
          .sort((a, b) => {
            if (sortOrder === "newest") return new Date(b.entry.purchasedAt).getTime() - new Date(a.entry.purchasedAt).getTime();
            if (sortOrder === "oldest") return new Date(a.entry.purchasedAt).getTime() - new Date(b.entry.purchasedAt).getTime();
            return (a.tpl?.title ?? a.templateId).localeCompare(b.tpl?.title ?? b.templateId, "ar");
          });

        const categoryCounts: Record<string, number> = {};
        purchasedList.forEach(({ tpl }) => {
          if (tpl) categoryCounts[tpl.category] = (categoryCounts[tpl.category] || 0) + 1;
        });

        const searchFiltered = categoryFilter === "all" ? purchasedList : purchasedList.filter(({ tpl }) => tpl?.category === categoryFilter);
        const filteredList = searchQuery.trim()
          ? searchFiltered.filter(({ tpl, templateId }) =>
              tpl?.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
              templateId.toLowerCase().includes(searchQuery.trim().toLowerCase()))
          : searchFiltered;

        const pdfCount = filteredList.filter(({ tpl }) => tpl?.pdfUrl).length;
        const wordCount = filteredList.filter(({ tpl }) => tpl?.wordUrl).length;

        const handleDownloadAll = (format: "pdf" | "word") => {
          filteredList.forEach(({ tpl }) => {
            const url = format === "pdf" ? tpl?.pdfUrl : tpl?.wordUrl;
            if (url) window.open(url, "_blank");
          });
          setDownloadAllConfirm(null);
        };

        return (
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="section-title text-lg !mb-0">النماذج المشتراة</h2>
              {purchasedList.length > 0 && (
                <div className="flex items-center gap-2">
                  <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-400 text-rose-500 text-xs font-semibold hover:bg-rose-50 transition-colors">
                    <FileDown size={12} strokeWidth={2} />تصدير PDF
                  </button>
                  {wordCount > 0 && (
                    <button
                      onClick={() => setDownloadAllConfirm(downloadAllConfirm === "word" ? null : "word")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${downloadAllConfirm === "word" ? "bg-[#0B2A4A] border-[#0B2A4A] text-white" : "border-[#0B2A4A] text-[#0B2A4A] hover:bg-[#0B2A4A] hover:text-white"}`}
                    >
                      <Download size={12} strokeWidth={2} />تنزيل الكل Word
                    </button>
                  )}
                  {pdfCount > 0 && (
                    <button
                      onClick={() => setDownloadAllConfirm(downloadAllConfirm === "pdf" ? null : "pdf")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${downloadAllConfirm === "pdf" ? "bg-[#2BB6A3] border-[#2BB6A3] text-white" : "border-[#2BB6A3] text-[#2BB6A3] hover:bg-[#2BB6A3] hover:text-white"}`}
                    >
                      <Download size={12} strokeWidth={2} />تنزيل الكل PDF
                    </button>
                  )}
                </div>
              )}
            </div>

            {downloadAllConfirm && (
              <div className={`mt-3 mb-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3 border ${downloadAllConfirm === "pdf" ? "bg-teal-50 border-teal-200" : "bg-blue-50 border-blue-200"}`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${downloadAllConfirm === "pdf" ? "bg-[#2BB6A3]" : "bg-[#0B2A4A]"}`}>
                    <Download size={15} className="text-white" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-medium text-text-primary">
                    سيتم فتح <strong>{downloadAllConfirm === "pdf" ? pdfCount : wordCount}</strong> ملف {downloadAllConfirm.toUpperCase()} في تبويبات جديدة. هل تريد المتابعة؟
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleDownloadAll(downloadAllConfirm)} className={`px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-colors ${downloadAllConfirm === "pdf" ? "bg-[#2BB6A3] hover:bg-teal-600" : "bg-[#0B2A4A] hover:bg-[#0d3260]"}`}>تأكيد</button>
                  <button onClick={() => setDownloadAllConfirm(null)} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors">إلغاء</button>
                </div>
              </div>
            )}

            {purchasedList.length > 0 && (
              <div className="flex gap-2 mt-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                    <Search size={14} className="text-text-muted" strokeWidth={1.75} />
                  </div>
                  <input
                    type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث في مشترياتك..."
                    className="w-full pr-9 pl-9 py-2.5 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all placeholder:text-text-muted"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted hover:text-text-primary transition-colors">
                      <X size={13} strokeWidth={2} />
                    </button>
                  )}
                </div>
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
                    <ArrowDownUp size={12} className="text-text-muted" strokeWidth={2} />
                  </div>
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest" | "alpha")} className="pr-7 pl-3 py-2.5 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all text-text-primary appearance-none cursor-pointer">
                    <option value="newest">من الأحدث</option>
                    <option value="oldest">من الأقدم</option>
                    <option value="alpha">أبجدياً</option>
                  </select>
                </div>
              </div>
            )}

            {purchasedList.length > 0 && Object.keys(categoryCounts).length > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-3 mb-4 p-1 bg-gray-50 rounded-xl border border-border">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${categoryFilter === "all" ? "bg-[#0B2A4A] text-white shadow-sm" : "text-text-secondary hover:bg-white hover:text-primary-500"}`}
                >
                  الكل
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${categoryFilter === "all" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"}`}>{purchasedList.length}</span>
                </button>
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <button
                    key={cat} onClick={() => setCategoryFilter(cat)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${categoryFilter === cat ? "bg-[#2BB6A3] text-white shadow-sm" : "text-text-secondary hover:bg-white hover:text-primary-500"}`}
                  >
                    {cat.replace(/_/g, " ")}
                    <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${categoryFilter === cat ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"}`}>{count}</span>
                  </button>
                ))}
              </div>
            )}

            {purchasedList.length === 0 ? (
              <EmptyState message="لا توجد مشتريات بعد" sub="تصفّح المكتبة واشترِ النماذج التي تحتاجها" ctaLabel="استعراض المكتبة" ctaTo="/library" />
            ) : filteredList.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg border border-border">
                {searchQuery.trim() ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"><Search size={18} className="text-gray-400" strokeWidth={1.75} /></div>
                    <p className="text-text-primary text-sm font-medium mb-1">لا توجد نتائج مطابقة</p>
                    <p className="text-text-muted text-xs mb-3">لم يُعثر على نموذج يحتوي على "{searchQuery}"</p>
                    <button onClick={() => setSearchQuery("")} className="text-xs text-teal hover:underline">مسح البحث</button>
                  </>
                ) : (
                  <p className="text-text-muted text-sm">لا توجد نماذج في هذه الفئة</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredList.map(({ templateId, entry, tpl }) => (
                  <div key={templateId} className="bg-white border border-border rounded-xl px-4 py-3.5 hover:border-teal-200 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ShoppingBag size={17} className="text-emerald-600" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          {tpl ? (
                            <Link to={`/template/${templateId}`} className="font-heading font-semibold text-sm text-primary-500 hover:text-teal leading-tight line-clamp-1 hover:underline">{tpl.title}</Link>
                          ) : (
                            <span className="font-heading font-semibold text-sm text-primary-500 leading-tight truncate">{templateId}</span>
                          )}
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-shrink-0">مشترى ✓</span>
                        </div>
                        {tpl && <p className="text-xs text-text-muted mb-1">{tpl.category.replace(/_/g, " ")} · {tpl.pageCount} صفحة</p>}
                        <p className="text-xs text-text-muted">
                          تاريخ الشراء:{" "}
                          <span className="text-text-secondary">
                            {new Date(entry.purchasedAt).toLocaleString("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {tpl?.wordUrl ? (
                          <a href={tpl.wordUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#0B2A4A] text-[#0B2A4A] text-xs font-semibold hover:bg-[#0B2A4A] hover:text-white transition-colors">
                            <Download size={11} strokeWidth={2} />Word
                          </a>
                        ) : null}
                        {tpl?.pdfUrl ? (
                          <a href={tpl.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#2BB6A3] text-[#2BB6A3] text-xs font-semibold hover:bg-[#2BB6A3] hover:text-white transition-colors">
                            <Download size={11} strokeWidth={2} />PDF
                          </a>
                        ) : null}
                        {tpl && !tpl.wordUrl && !tpl.pdfUrl && (
                          <Link to={`/template/${templateId}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-500 text-xs border border-gray-200 hover:bg-gray-100 transition-colors">
                            <ExternalLink size={11} />عرض
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Profile ── */}
      {activeTab === "profile" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title text-lg !mb-0">بيانات الجمعية</h2>
            {!editing ? (
              <button onClick={() => { setDraftProfile(profile); setEditing(true); }} className="flex items-center gap-1.5 text-sm text-teal hover:underline">
                <Edit3 size={14} />تعديل
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSaveProfile} className="btn-teal py-2 px-4 text-sm flex items-center gap-1.5"><Save size={14} />حفظ</button>
                <button onClick={cancelEdit} className="btn-outline py-2 px-4 text-sm flex items-center gap-1.5"><X size={14} />إلغاء</button>
              </div>
            )}
          </div>
          <div className="card">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { label: "اسم المسؤول", field: "name" as keyof UserProfile },
                { label: "اسم الجمعية", field: "associationName" as keyof UserProfile },
                { label: "رقم الترخيص", field: "licenseNumber" as keyof UserProfile },
                { label: "المدينة", field: "city" as keyof UserProfile },
                { label: "البريد الإلكتروني", field: "email" as keyof UserProfile },
                { label: "رقم الجوال", field: "phone" as keyof UserProfile },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
                  {editing ? (
                    <input type="text" value={draftProfile[field]} onChange={(e) => setDraftProfile({ ...draftProfile, [field]: e.target.value })} className="input-field py-2.5 text-sm" />
                  ) : (
                    <p className="text-text-primary text-base font-medium bg-background rounded-md px-4 py-2.5 border border-border">{profile[field] || "—"}</p>
                  )}
                </div>
              ))}
            </div>
            {!editing && (
              <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <p className="text-teal text-sm font-medium mb-1">تعبئة تلقائية في النماذج</p>
                <p className="text-text-secondary text-sm">تُستخدم هذه البيانات لتعبئة خانات الجمعية تلقائياً في النماذج المنزَّلة عند تفعيل هذه الميزة.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ message, sub, ctaLabel, ctaTo }: { message: string; sub: string; ctaLabel: string; ctaTo: string }) {
  return (
    <div className="text-center py-16 bg-white rounded-lg border border-border">
      <p className="text-text-muted text-base mb-1">{message}</p>
      <p className="text-text-muted text-sm mb-5">{sub}</p>
      <Link to={ctaTo} className="btn-teal inline-flex">{ctaLabel}</Link>
    </div>
  );
}
