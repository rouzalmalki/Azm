import { useState, useMemo } from "react";
import {
  MessageSquare, Search, Archive, MailOpen, Mail,
  CheckSquare, Square, ChevronDown, X, Clock,
  Phone, Send, RotateCcw, Tag, Calendar, Download,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ContactMessage } from "@/pages/Contact";

/* ─── Demo seed messages ─── */
const DEMO_MESSAGES: ContactMessage[] = [
  { id: "demo-1", name: "أحمد الزهراني", email: "ahmed@npo.sa", phone: "0501234567", subject: "استفسار عن نموذج", message: "أريد الاستفسار عن نموذج محضر اجتماع مجلس الإدارة وهل يمكن تعديله بحيث يناسب جمعيتنا الصغيرة التي لا تزيد على ١٥ عضواً.", sentAt: new Date(Date.now() - 25 * 60000).toISOString(), read: true },
  { id: "demo-2", name: "سارة المالكي", email: "sara@ngo.org", phone: "", subject: "مشكلة في الدفع أو التنزيل", message: "واجهت مشكلة عند محاولة تنزيل النموذج بعد الدفع. الصفحة لا تستجيب وظهرت رسالة خطأ بعد إتمام الدفع عبر البطاقة.", sentAt: new Date(Date.now() - 2 * 3600000).toISOString(), read: false },
  { id: "demo-3", name: "محمد العمري", email: "m.omari@charity.sa", phone: "0557654321", subject: "طلب نموذج جديد", message: "هل يمكن إضافة نموذج خطة استراتيجية خمسية للجمعية؟ نحتاجه لتقديمه للجهة المانحة بحلول نهاية الشهر.", sentAt: new Date(Date.now() - 5 * 3600000).toISOString(), read: false },
  { id: "demo-4", name: "نوف القحطاني", email: "nof@assoc.sa", phone: "", subject: "شراكة أو تعاون مؤسسي", message: "نودّ التواصل بشأن إمكانية الشراكة مع منصة عزم في تدريب الجمعيات على استخدام النماذج وإدارة الوثائق بشكل احترافي.", sentAt: new Date(Date.now() - 18 * 3600000).toISOString(), read: true },
  { id: "demo-5", name: "خالد الدوسري", email: "k.dosari@npo.com", phone: "0509876543", subject: "اقتراح أو ملاحظة", message: "أقترح إضافة ميزة البحث المتقدم بالفلتر المتعدد في صفحة المكتبة مع إمكانية البحث بمحتوى النموذج وليس العنوان فقط.", sentAt: new Date(Date.now() - 30 * 3600000).toISOString(), read: true },
  { id: "demo-6", name: "رنا السبيعي", email: "rana@community.org", phone: "", subject: "دعم فني", message: "الصفحة لا تعمل بشكل صحيح على متصفح الجوال، خاصةً قسم سلة التسوق الذي لا يفتح عند الضغط على أيقونة السلة.", sentAt: new Date(Date.now() - 2 * 86400000).toISOString(), read: true },
  { id: "demo-7", name: "عبدالله الشمري", email: "a.shamri@org.sa", phone: "", subject: "استفسار عن نموذج", message: "هل نموذج اللائحة الداخلية متوافق مع متطلبات عام 2026؟ سمعت أن هناك تعديلات في اشتراطات وزارة الموارد البشرية.", sentAt: new Date(Date.now() - 3 * 86400000).toISOString(), read: true },
  { id: "demo-8", name: "ليلى الحربي", email: "laila@nonprofit.sa", phone: "0531112233", subject: "اقتراح أو ملاحظة", message: "أقترح إضافة نماذج بالإنجليزية لمساعدة الجمعيات في التواصل الدولي مع المنظمات والجهات التمويلية الأجنبية.", sentAt: new Date(Date.now() - 4 * 86400000).toISOString(), read: true },
  { id: "demo-9", name: "فيصل الغامدي", email: "faisal@ghd.sa", phone: "0500001122", subject: "مشكلة في الدفع أو التنزيل", message: "تم خصم المبلغ من بطاقتي ولكن لم أتمكن من تنزيل النموذج. أرجو المساعدة في حل هذه المشكلة بأسرع وقت.", sentAt: new Date(Date.now() - 5 * 86400000).toISOString(), read: false },
  { id: "demo-10", name: "هند العتيبي", email: "hend@eta.org", phone: "", subject: "طلب نموذج جديد", message: "نحتاج نموذج تقرير إنجاز نصف سنوي لتقديمه للجهة المانحة. هل يمكن إضافته للمكتبة قريباً؟", sentAt: new Date(Date.now() - 7 * 86400000).toISOString(), read: true },
];

/* ─── Constants ─── */
const SUBJECT_OPTIONS = [
  "استفسار عن نموذج",
  "طلب نموذج جديد",
  "مشكلة في الدفع أو التنزيل",
  "اقتراح أو ملاحظة",
  "شراكة أو تعاون مؤسسي",
  "دعم فني",
  "أخرى",
];

const SUBJECT_COLORS: Record<string, string> = {
  "استفسار عن نموذج": "#3b82f6",
  "طلب نموذج جديد": "#8b5cf6",
  "مشكلة في الدفع أو التنزيل": "#ef4444",
  "اقتراح أو ملاحظة": "#f59e0b",
  "شراكة أو تعاون مؤسسي": "#10b981",
  "دعم فني": "#6366f1",
  "أخرى": "#9ca3af",
};

const DATE_RANGES = [
  { key: "all", label: "كل الأوقات" },
  { key: "today", label: "اليوم" },
  { key: "week", label: "آخر 7 أيام" },
  { key: "month", label: "آخر 30 يوم" },
];

/* ─── Helpers ─── */
function formatRelTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isInDateRange(iso: string, range: string): boolean {
  const diff = Date.now() - new Date(iso).getTime();
  if (range === "all") return true;
  if (range === "today") return diff < 86400000;
  if (range === "week") return diff < 7 * 86400000;
  if (range === "month") return diff < 30 * 86400000;
  return true;
}

/* ─── CSV Export ─── */
function exportToCSV(messages: ExtMessage[], filename: string) {
  const headers = ["الاسم", "البريد الإلكتروني", "الجوال", "الموضوع", "الرسالة", "تاريخ الإرسال", "حالة القراءة"];
  const rows = messages.map((m) => [
    m.name,
    m.email,
    m.phone || "",
    m.subject,
    m.message.replace(/"/g, '""'),
    new Date(m.sentAt).toLocaleString("ar-SA"),
    m.read ? "مقروءة" : "غير مقروءة",
  ]);
  const bom = "\uFEFF";
  const csv =
    bom +
    [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/* ─── Extended Message Type (with archived) ─── */
type ExtMessage = ContactMessage & { archived?: boolean };

export default function AdminMessages() {
  const [storedMessages, setStoredMessages] = useLocalStorage<ExtMessage[]>("azm_messages", []);

  /* Merge real + demo, deduplicate by id */
  const allMessages = useMemo<ExtMessage[]>(() => {
    const ids = new Set(storedMessages.map((m) => m.id));
    const demos = DEMO_MESSAGES.map((m) => ({ ...m, archived: false })).filter(
      (m) => !ids.has(m.id)
    );
    return [...storedMessages, ...demos];
  }, [storedMessages]);

  /* ─── Filter state ─── */
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");
  const [showArchived, setShowArchived] = useState(false);
  const [subjectDropdown, setSubjectDropdown] = useState(false);

  /* ─── Selection ─── */
  const [selected, setSelected] = useState<Set<string>>(new Set());

  /* ─── Detail panel ─── */
  const [active, setActive] = useState<ExtMessage | null>(null);

  /* ─── Filtered list ─── */
  const filtered = useMemo(() => {
    return allMessages.filter((m) => {
      if (showArchived ? !m.archived : m.archived) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.email.toLowerCase().includes(q) &&
          !m.message.toLowerCase().includes(q) &&
          !m.subject.toLowerCase().includes(q)
        )
          return false;
      }
      if (subjectFilter !== "all" && m.subject !== subjectFilter) return false;
      if (readFilter === "unread" && m.read) return false;
      if (readFilter === "read" && !m.read) return false;
      if (!isInDateRange(m.sentAt, dateRange)) return false;
      return true;
    });
  }, [allMessages, search, subjectFilter, readFilter, dateRange, showArchived]);

  /* ─── Counts ─── */
  const unreadCount = allMessages.filter((m) => !m.archived && !m.read).length;
  const archivedCount = allMessages.filter((m) => m.archived).length;

  /* ─── Mutate helpers ─── */
  function updateMessages(updater: (msgs: ExtMessage[]) => ExtMessage[]) {
    setStoredMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const demos = DEMO_MESSAGES.map((m) => ({ ...m, archived: false })).filter(
        (m) => !ids.has(m.id)
      );
      const merged = [...prev, ...demos];
      return updater(merged);
    });
  }

  function toggleRead(id: string) {
    updateMessages((msgs) =>
      msgs.map((m) => (m.id === id ? { ...m, read: !m.read } : m))
    );
    if (active?.id === id) setActive((a) => (a ? { ...a, read: !a.read } : null));
  }

  function toggleArchive(id: string) {
    updateMessages((msgs) =>
      msgs.map((m) => (m.id === id ? { ...m, archived: !m.archived } : m))
    );
    if (active?.id === id) setActive(null);
  }

  function bulkMarkRead(ids: Set<string>, value: boolean) {
    updateMessages((msgs) =>
      msgs.map((m) => (ids.has(m.id) ? { ...m, read: value } : m))
    );
    setSelected(new Set());
  }

  function bulkArchive(ids: Set<string>) {
    updateMessages((msgs) =>
      msgs.map((m) => (ids.has(m.id) ? { ...m, archived: true } : m))
    );
    setSelected(new Set());
    setActive(null);
  }

  function bulkUnarchive(ids: Set<string>) {
    updateMessages((msgs) =>
      msgs.map((m) => (ids.has(m.id) ? { ...m, archived: false } : m))
    );
    setSelected(new Set());
  }

  function openMessage(msg: ExtMessage) {
    setActive(msg);
    if (!msg.read) toggleRead(msg.id);
  }

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((m) => selected.has(m.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((m) => m.id)));
    }
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-heading font-bold text-2xl text-[#0B2A4A]">رسائل التواصل</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {allMessages.filter((m) => !m.archived).length} رسالة نشطة
            {unreadCount > 0 && (
              <span className="mr-2 bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {unreadCount} غير مقروءة
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() =>
              exportToCSV(
                filtered,
                `رسائل-عزم-${new Date().toLocaleDateString("ar-SA").replace(/\//g, "-")}.csv`
              )
            }
            disabled={filtered.length === 0}
            title={`تصدير ${filtered.length} رسالة كـ CSV`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <Download size={15} strokeWidth={1.75} />
            تصدير CSV
            {filtered.length > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {filtered.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setShowArchived(false); setActive(null); setSelected(new Set()); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              !showArchived
                ? "bg-[#0B2A4A] text-white border-[#0B2A4A]"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}>
            <MessageSquare size={15} strokeWidth={1.75} />
            الوارد
          </button>
          <button
            onClick={() => { setShowArchived(true); setActive(null); setSelected(new Set()); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              showArchived
                ? "bg-[#0B2A4A] text-white border-[#0B2A4A]"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}>
            <Archive size={15} strokeWidth={1.75} />
            الأرشيف
            {archivedCount > 0 && (
              <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {archivedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ minHeight: 540 }}>

        {/* ── Filters Bar ── */}
        <div className="border-b border-gray-100 px-4 py-3 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.75} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في الرسائل..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pr-8 pl-3 py-2 text-sm focus:outline-none focus:border-teal-400 focus:bg-white transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Subject dropdown */}
          <div className="relative">
            <button
              onClick={() => setSubjectDropdown((v) => !v)}
              className={`flex items-center gap-1.5 border rounded-lg px-3 py-2 text-sm transition-all ${
                subjectFilter !== "all"
                  ? "border-teal-400 bg-teal-50 text-teal-700"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
              }`}>
              <Tag size={14} strokeWidth={1.75} />
              {subjectFilter === "all" ? "الموضوع" : subjectFilter.slice(0, 14) + (subjectFilter.length > 14 ? "…" : "")}
              <ChevronDown size={12} strokeWidth={2} className={`transition-transform ${subjectDropdown ? "rotate-180" : ""}`} />
            </button>
            {subjectDropdown && (
              <div className="absolute top-full mt-1 right-0 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                <button
                  onClick={() => { setSubjectFilter("all"); setSubjectDropdown(false); }}
                  className={`w-full text-right px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors ${subjectFilter === "all" ? "font-semibold text-[#0B2A4A]" : "text-gray-600"}`}>
                  كل المواضيع
                </button>
                {SUBJECT_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSubjectFilter(s); setSubjectDropdown(false); }}
                    className={`w-full text-right px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors flex items-center gap-2 ${subjectFilter === s ? "font-semibold text-[#0B2A4A]" : "text-gray-600"}`}>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: SUBJECT_COLORS[s] ?? "#9ca3af" }}
                    />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date range pills */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {DATE_RANGES.map((dr) => (
              <button
                key={dr.key}
                onClick={() => setDateRange(dr.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  dateRange === dr.key
                    ? "bg-white text-[#0B2A4A] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                {dr.label}
              </button>
            ))}
          </div>

          {/* Read filter */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {([["all", "الكل"], ["unread", "غير مقروءة"], ["read", "مقروءة"]] as const).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setReadFilter(k)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  readFilter === k
                    ? "bg-white text-[#0B2A4A] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                {l}
              </button>
            ))}
          </div>

          {/* Clear filters */}
          {(search || subjectFilter !== "all" || dateRange !== "all" || readFilter !== "all") && (
            <button
              onClick={() => { setSearch(""); setSubjectFilter("all"); setDateRange("all"); setReadFilter("all"); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              <X size={13} />
              مسح الفلاتر
            </button>
          )}
        </div>

        {/* ── Bulk Action Bar ── */}
        {selected.size > 0 && (
          <div className="border-b border-gray-100 px-4 py-2.5 bg-teal-50 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-teal-700">{selected.size} رسالة محددة</span>
            <div className="flex gap-2 mr-auto">
              <button
                onClick={() => bulkMarkRead(selected, true)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-all">
                <MailOpen size={13} strokeWidth={1.75} />
                تعليم مقروء
              </button>
              <button
                onClick={() => bulkMarkRead(selected, false)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-all">
                <Mail size={13} strokeWidth={1.75} />
                تعليم غير مقروء
              </button>
              {showArchived ? (
                <button
                  onClick={() => bulkUnarchive(selected)}
                  className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-all">
                  <RotateCcw size={13} strokeWidth={1.75} />
                  إلغاء الأرشفة
                </button>
              ) : (
                <button
                  onClick={() => bulkArchive(selected)}
                  className="flex items-center gap-1.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-all">
                  <Archive size={13} strokeWidth={1.75} />
                  أرشفة
                </button>
              )}
              <button
                onClick={() => setSelected(new Set())}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        <div className="flex" style={{ minHeight: 460 }}>
          {/* ── Messages List ── */}
          <div className={`flex flex-col border-l border-gray-100 ${active ? "w-2/5 hidden lg:flex" : "flex-1"}`}>
            {/* List header */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50">
              <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                {allFilteredSelected
                  ? <CheckSquare size={16} className="text-teal-500" strokeWidth={1.75} />
                  : <Square size={16} strokeWidth={1.75} />}
              </button>
              <span className="text-xs text-gray-400">
                {filtered.length === 0
                  ? "لا توجد رسائل"
                  : `${filtered.length} رسالة`}
              </span>
            </div>

            {/* Messages */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-16 text-gray-400">
                <MessageSquare size={36} strokeWidth={1.25} className="mb-3" />
                <p className="text-sm font-medium">لا توجد رسائل مطابقة</p>
                <p className="text-xs mt-1">جرب تعديل معايير البحث أو الفلتر</p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1">
                {filtered.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 cursor-pointer transition-colors group ${
                      active?.id === msg.id ? "bg-teal-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => openMessage(msg)}>
                    {/* Checkbox */}
                    <div
                      className="flex-shrink-0 mt-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(msg.id)) next.delete(msg.id);
                          else next.add(msg.id);
                          return next;
                        });
                      }}>
                      {selected.has(msg.id)
                        ? <CheckSquare size={15} className="text-teal-500" strokeWidth={1.75} />
                        : <Square size={15} className="text-gray-300 group-hover:text-gray-400" strokeWidth={1.75} />}
                    </div>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B2A4A] to-[#2BB6A3] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{msg.name[0]}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${!msg.read ? "font-semibold text-[#0B2A4A]" : "text-gray-700"}`}>
                          {msg.name}
                        </p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{formatRelTime(msg.sentAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white flex-shrink-0"
                          style={{ background: SUBJECT_COLORS[msg.subject] ?? "#9ca3af" }}>
                          {msg.subject.length > 16 ? msg.subject.slice(0, 16) + "…" : msg.subject}
                        </span>
                        {!msg.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Message Detail Panel ── */}
          {active ? (
            <div className={`flex flex-col ${active ? "flex-1" : "hidden"}`}>
              {/* Detail Header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 flex-wrap">
                <button
                  onClick={() => setActive(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors lg:hidden">
                  <X size={18} />
                </button>
                <div className="flex items-center gap-2 mr-auto">
                  {/* Toggle read */}
                  <button
                    onClick={() => toggleRead(active.id)}
                    title={active.read ? "تعليم كغير مقروء" : "تعليم كمقروء"}
                    className="flex items-center gap-1.5 border border-gray-200 hover:border-gray-300 bg-white text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-all">
                    {active.read
                      ? <><Mail size={13} strokeWidth={1.75} /> غير مقروء</>
                      : <><MailOpen size={13} strokeWidth={1.75} /> مقروء</>}
                  </button>
                  {/* Archive / Unarchive */}
                  {active.archived ? (
                    <button
                      onClick={() => toggleArchive(active.id)}
                      className="flex items-center gap-1.5 border border-gray-200 hover:border-gray-300 bg-white text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-all">
                      <RotateCcw size={13} strokeWidth={1.75} /> إلغاء أرشفة
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleArchive(active.id)}
                      className="flex items-center gap-1.5 border border-amber-300 hover:bg-amber-50 bg-white text-amber-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-all">
                      <Archive size={13} strokeWidth={1.75} /> أرشفة
                    </button>
                  )}
                </div>
              </div>

              {/* Detail Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {/* Sender Info */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0B2A4A] to-[#2BB6A3] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-bold">{active.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-[#0B2A4A] text-base">{active.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <a href={`mailto:${active.email}`} className="flex items-center gap-1 text-xs text-teal-600 hover:underline" dir="ltr">
                        <Send size={11} strokeWidth={1.75} />
                        {active.email}
                      </a>
                      {active.phone && (
                        <a href={`tel:${active.phone}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700" dir="ltr">
                          <Phone size={11} strokeWidth={1.75} />
                          {active.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                    style={{ background: SUBJECT_COLORS[active.subject] ?? "#9ca3af" }}>
                    {active.subject}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={12} strokeWidth={1.75} />
                    {formatFullDate(active.sentAt)}
                  </span>
                </div>

                {/* Message body */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm text-gray-700 leading-[1.85] mb-6">
                  {active.message}
                </div>

                {/* Quick Reply Actions */}
                <div className="flex gap-3 flex-wrap">
                  <a
                    href={`mailto:${active.email}?subject=رد: ${active.subject}`}
                    className="flex items-center gap-2 bg-[#0B2A4A] hover:bg-[#0d3360] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                    <Send size={14} strokeWidth={2} />
                    الرد عبر البريد
                  </a>
                  {active.phone && (
                    <a
                      href={`https://wa.me/966${active.phone.replace(/^0/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-700 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                      <Phone size={14} strokeWidth={2} />
                      واتساب
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Empty state when no message selected
            filtered.length > 0 && (
              <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-gray-400 gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <MessageSquare size={28} strokeWidth={1.25} />
                </div>
                <p className="text-sm font-medium">اختر رسالة لعرضها</p>
                <p className="text-xs">انقر على أي رسالة من القائمة لعرض تفاصيلها</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الرسائل", value: allMessages.filter((m) => !m.archived).length, color: "text-[#0B2A4A]" },
          { label: "غير مقروءة", value: unreadCount, color: "text-red-500" },
          { label: "مقروءة", value: allMessages.filter((m) => !m.archived && m.read).length, color: "text-emerald-600" },
          { label: "مؤرشفة", value: archivedCount, color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`font-heading font-bold text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
