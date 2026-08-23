import { useState, useRef } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Star,
  Download,
  ChevronDown,
  X,
  FileText,
  Upload,
  File,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cloud,
} from "lucide-react";
import { TEMPLATES, CATEGORIES } from "@/constants/data";
import type { Template, TemplateCategory, DocumentType, TargetEntity } from "@/types";
import { DOCUMENT_TYPES, TARGET_ENTITIES } from "@/constants/data";
import { supabase } from "@/lib/supabase";

// ─── Add Template Modal ────────────────────────────────────────────────────
interface UploadedFile { file: File; name: string; size: string; }

interface AddTemplateForm {
  title: string;
  description: string;
  category: TemplateCategory | "";
  documentType: DocumentType | "";
  targetEntity: TargetEntity | "";
  tags: string;
  isFeatured: boolean;
  isNew: boolean;
  wordFile: UploadedFile | null;
  pdfFile: UploadedFile | null;
}

const EMPTY_FORM: AddTemplateForm = {
  title: "", description: "", category: "", documentType: "",
  targetEntity: "", tags: "", isFeatured: false, isNew: true,
  wordFile: null, pdfFile: null,
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

interface FileUploadZoneProps {
  label: string;
  accept: string;
  acceptLabel: string;
  color: string;
  file: UploadedFile | null;
  onChange: (f: UploadedFile | null) => void;
}

function FileUploadZone({ label, accept, acceptLabel, color, file, onChange }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f: File) => {
    onChange({ file: f, name: f.name, size: formatFileSize(f.size) });
  };

  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-1.5">{label}</p>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer text-center
          ${dragging ? `border-${color}-400 bg-${color}-50` : file ? "border-emerald-300 bg-emerald-50" : "border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-white"}`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-800 line-clamp-1">{file.name}</p>
                <p className="text-[10px] text-gray-400">{file.size}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="py-2">
            <Upload size={20} className="mx-auto text-gray-400 mb-1.5" />
            <p className="text-xs text-gray-500">اسحب الملف هنا أو <span className="text-teal-600 font-semibold">تصفح</span></p>
            <p className="text-[10px] text-gray-400 mt-0.5">{acceptLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminTemplates() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "new">("all");
  const [templates, setTemplates] = useState<Template[]>(TEMPLATES);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 8;

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<AddTemplateForm>(EMPTY_FORM);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ word?: string; pdf?: string }>({});

  const filtered = templates.filter((t) => {
    const matchSearch =
      !search ||
      t.title.includes(search) ||
      t.description.includes(search) ||
      t.tags.some((tag) => tag.includes(search));
    const matchCat = categoryFilter === "all" || t.category === categoryFilter;
    const matchFeatured =
      featuredFilter === "all" ||
      (featuredFilter === "featured" && t.isFeatured) ||
      (featuredFilter === "new" && t.isNew);
    return matchSearch && matchCat && matchFeatured;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleToggleFeatured = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFeatured: !t.isFeatured } : t))
    );
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setDeleteId(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.title.trim() || !addForm.category || !addForm.documentType || !addForm.targetEntity) {
      setAddError("يُرجى تعبئة جميع الحقول الإلزامية.");
      return;
    }
    if (!addForm.wordFile && !addForm.pdfFile) {
      setAddError("يُرجى رفع ملف Word أو PDF على الأقل.");
      return;
    }

    setSaving(true);
    setAddError("");
    setUploadProgress({});

    let wordUrl: string | undefined;
    let pdfUrl: string | undefined;

    // ── Upload Word file ──────────────────────────────────────────────────
    if (addForm.wordFile) {
      setUploadProgress((p) => ({ ...p, word: "جارٍ الرفع..." }));
      const ext = addForm.wordFile.name.split(".").pop() ?? "docx";
      const path = `word/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { data, error } = await supabase.storage
        .from("template-files")
        .upload(path, addForm.wordFile.file, { contentType: addForm.wordFile.file.type, upsert: false });
      if (error) {
        setAddError(`خطأ في رفع ملف Word: ${error.message}`);
        setSaving(false);
        setUploadProgress({});
        return;
      }
      const { data: pub } = supabase.storage.from("template-files").getPublicUrl(data.path);
      wordUrl = pub.publicUrl;
      setUploadProgress((p) => ({ ...p, word: "✓ تم الرفع" }));
      console.log("[storage] Word uploaded:", wordUrl);
    }

    // ── Upload PDF file ───────────────────────────────────────────────────
    if (addForm.pdfFile) {
      setUploadProgress((p) => ({ ...p, pdf: "جارٍ الرفع..." }));
      const path = `pdf/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.pdf`;
      const { data, error } = await supabase.storage
        .from("template-files")
        .upload(path, addForm.pdfFile.file, { contentType: "application/pdf", upsert: false });
      if (error) {
        setAddError(`خطأ في رفع ملف PDF: ${error.message}`);
        setSaving(false);
        setUploadProgress({});
        return;
      }
      const { data: pub } = supabase.storage.from("template-files").getPublicUrl(data.path);
      pdfUrl = pub.publicUrl;
      setUploadProgress((p) => ({ ...p, pdf: "✓ تم الرفع" }));
      console.log("[storage] PDF uploaded:", pdfUrl);
    }

    // ── Save to database ──────────────────────────────────────────────────
    const newId = `tpl-${Date.now()}`;
    const today = new Date().toISOString().split("T")[0];

    const { error: dbError } = await supabase.from("templates").insert({
      id: newId,
      title: addForm.title.trim(),
      description: addForm.description.trim(),
      category: addForm.category,
      document_type: addForm.documentType,
      target_entity: addForm.targetEntity,
      tags: addForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_featured: addForm.isFeatured,
      is_new: addForm.isNew,
      word_url: wordUrl ?? null,
      pdf_url: pdfUrl ?? null,
      last_updated: today,
    });

    if (dbError) {
      setAddError(`خطأ في حفظ البيانات: ${dbError.message}`);
      setSaving(false);
      setUploadProgress({});
      return;
    }

    console.log("[db] template saved:", newId);

    // ── Add to local state ────────────────────────────────────────────────
    const newTpl: Template = {
      id: newId,
      title: addForm.title.trim(),
      description: addForm.description.trim(),
      category: addForm.category as TemplateCategory,
      documentType: addForm.documentType as DocumentType,
      targetEntity: addForm.targetEntity as TargetEntity,
      tags: addForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      lastUpdated: today,
      downloads: 0,
      rating: 0,
      isNew: addForm.isNew,
      isFeatured: addForm.isFeatured,
      wordUrl,
      pdfUrl,
      previewText: "",
      relatedIds: [],
      pageCount: 1,
      version: "1.0",
    };

    setTemplates((prev) => [newTpl, ...prev]);
    setSaving(false);
    setAddSuccess(true);
    setTimeout(() => {
      setShowAddModal(false);
      setAddForm(EMPTY_FORM);
      setAddError("");
      setAddSuccess(false);
      setUploadProgress({});
    }, 1800);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="font-heading font-bold text-2xl text-[#0B2A4A]">إدارة النماذج</h2>
          <p className="text-gray-500 text-sm mt-0.5">{templates.length} نموذج في المكتبة</p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setAddForm(EMPTY_FORM); setAddError(""); setAddSuccess(false); }}
          className="flex items-center gap-2 bg-[#2BB6A3] hover:bg-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          إضافة نموذج
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="بحث في النماذج..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pr-9 pl-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-teal-400 focus:bg-white transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pr-4 pl-8 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              <option value="all">جميع التصنيفات</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(["all", "featured", "new"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFeaturedFilter(f); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  featuredFilter === f
                    ? "bg-white text-[#0B2A4A] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f === "all" ? "الكل" : f === "featured" ? "مميز" : "جديد"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs">النموذج</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs hidden md:table-cell">التصنيف</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs hidden sm:table-cell">التنزيلات</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs hidden sm:table-cell">التقييم</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs">الحالة</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                    لا توجد نتائج مطابقة للبحث
                  </td>
                </tr>
              )}
              {paginated.map((tpl) => {
                const cat = CATEGORIES.find((c) => c.id === tpl.category);
                return (
                  <tr key={tpl.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Title */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FileText size={15} className="text-teal-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm line-clamp-1">{tpl.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">v{tpl.version} · {tpl.pageCount} صفحة</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {cat && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.color}`}>
                          {cat.label}
                        </span>
                      )}
                    </td>

                    {/* Downloads */}
                    <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                      <span className="flex items-center justify-center gap-1 text-gray-500 text-xs">
                        <Download size={12} />
                        {tpl.downloads.toLocaleString("ar-SA")}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                      <span className="flex items-center justify-center gap-1 text-amber-500 text-xs">
                        <Star size={12} fill="currentColor" />
                        {tpl.rating}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {tpl.isFeatured && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-100">
                            مميز
                          </span>
                        )}
                        {tpl.isNew && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                            جديد
                          </span>
                        )}
                        {!tpl.isFeatured && !tpl.isNew && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                            عادي
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleToggleFeatured(tpl.id)}
                          title={tpl.isFeatured ? "إلغاء التمييز" : "تمييز النموذج"}
                          className={`p-1.5 rounded-md transition-colors ${
                            tpl.isFeatured
                              ? "bg-teal-50 text-teal-500 hover:bg-teal-100"
                              : "text-gray-400 hover:bg-gray-100 hover:text-teal-500"
                          }`}
                        >
                          <Star size={15} fill={tpl.isFeatured ? "currentColor" : "none"} />
                        </button>
                        <button
                          className="p-1.5 rounded-md text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(tpl.id)}
                          className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              عرض {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} من {filtered.length}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                    p === currentPage
                      ? "bg-[#0B2A4A] text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Template Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Plus size={18} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[#0B2A4A] text-base">إضافة نموذج جديد</h3>
                  <p className="text-xs text-gray-400">ارفع ملفات النموذج وأدخل بياناته</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            {addSuccess ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={30} className="text-emerald-500" />
                </div>
                <p className="font-heading font-bold text-[#0B2A4A] text-lg">تمت الإضافة بنجاح!</p>
                <p className="text-gray-400 text-sm mt-1">تم رفع الملفات وحفظ النموذج في OnSpace Cloud</p>
                <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-teal-600">
                  <Cloud size={13} />
                  <span>الملفات محفوظة في Storage · البيانات في قاعدة البيانات</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddSubmit} className="p-6 space-y-5">

                {/* File Upload Section */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Upload size={13} className="text-teal-500" />
                      رفع ملفات النموذج إلى OnSpace Cloud Storage
                    </p>
                    <span className="flex items-center gap-1 text-[10px] text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                      <Cloud size={10} />
                      رفع فعلي
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <FileUploadZone
                        label="ملف Word"
                        accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        acceptLabel=".doc أو .docx"
                        color="blue"
                        file={addForm.wordFile}
                        onChange={(f) => setAddForm((p) => ({ ...p, wordFile: f }))}
                      />
                      {uploadProgress.word && (
                        <p className="text-[10px] text-teal-600 flex items-center gap-1">
                          {uploadProgress.word.startsWith("✓") ? <CheckCircle2 size={10} /> : <Loader2 size={10} className="animate-spin" />}
                          {uploadProgress.word}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <FileUploadZone
                        label="ملف PDF"
                        accept=".pdf,application/pdf"
                        acceptLabel="PDF فقط"
                        color="red"
                        file={addForm.pdfFile}
                        onChange={(f) => setAddForm((p) => ({ ...p, pdfFile: f }))}
                      />
                      {uploadProgress.pdf && (
                        <p className="text-[10px] text-teal-600 flex items-center gap-1">
                          {uploadProgress.pdf.startsWith("✓") ? <CheckCircle2 size={10} /> : <Loader2 size={10} className="animate-spin" />}
                          {uploadProgress.pdf}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <AlertCircle size={11} />
                    يُرجى رفع ملف Word أو PDF على الأقل — الحد الأقصى 10 ميجابايت
                  </p>
                </div>

                {/* Basic Info */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    اسم النموذج <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    value={addForm.title}
                    onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="مثال: محضر اجتماع مجلس الإدارة"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">الوصف</label>
                  <textarea
                    value={addForm.description}
                    onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="وصف مختصر للنموذج وما يحتويه..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 transition-all resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      التصنيف <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={addForm.category}
                      onChange={(e) => setAddForm((p) => ({ ...p, category: e.target.value as TemplateCategory }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 transition-all"
                    >
                      <option value="">اختر التصنيف</option>
                      {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      نوع الوثيقة <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={addForm.documentType}
                      onChange={(e) => setAddForm((p) => ({ ...p, documentType: e.target.value as DocumentType }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 transition-all"
                    >
                      <option value="">اختر النوع</option>
                      {DOCUMENT_TYPES.filter((d) => d.id !== "all").map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      الجهة المستهدفة <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={addForm.targetEntity}
                      onChange={(e) => setAddForm((p) => ({ ...p, targetEntity: e.target.value as TargetEntity }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 transition-all"
                    >
                      <option value="">اختر الجهة</option>
                      {TARGET_ENTITIES.filter((t) => t.id !== "all").map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">الوسوم (مفصولة بفاصلة)</label>
                  <input
                    value={addForm.tags}
                    onChange={(e) => setAddForm((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="مجلس الإدارة، قرارات، حوكمة"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 transition-all"
                  />
                </div>

                {/* Flags */}
                <div className="flex items-center gap-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={addForm.isNew}
                      onChange={(e) => setAddForm((p) => ({ ...p, isNew: e.target.checked }))}
                      className="w-4 h-4 rounded accent-teal-500"
                    />
                    <span className="text-xs text-gray-700 font-medium">وسم "جديد"</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={addForm.isFeatured}
                      onChange={(e) => setAddForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                      className="w-4 h-4 rounded accent-teal-500"
                    />
                    <span className="text-xs text-gray-700 font-medium">نموذج مميز</span>
                  </label>
                </div>

                {addError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-xs">
                    <AlertCircle size={14} />
                    {addError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-lg bg-[#2BB6A3] hover:bg-teal-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        جارٍ الرفع والحفظ...
                      </>
                    ) : (
                      <>
                        <Cloud size={15} />
                        رفع وحفظ في Cloud
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-heading font-bold text-[#0B2A4A] text-lg text-center mb-2">تأكيد الحذف</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              هل تريد حذف هذا النموذج نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
