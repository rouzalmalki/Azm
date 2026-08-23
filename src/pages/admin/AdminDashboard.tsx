import { useState } from "react";
import { FileText, Download, Users, TrendingUp, ArrowUp, ArrowDown, Clock, MessageSquare, Eye } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { TEMPLATES, STATS, CATEGORIES } from "@/constants/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ContactMessage } from "@/pages/Contact";

const recentTemplates = TEMPLATES.slice(0, 6);

type FilterRange = "7days" | "month" | "3months";
type CategoryFilterRange = "month" | "quarter" | "year";

const DOWNLOADS_BY_RANGE: Record<FilterRange, { label: string; تنزيلات: number }[]> = {
  "7days": [
    { label: "الأحد", تنزيلات: 5 },
    { label: "الاثنين", تنزيلات: 8 },
    { label: "الثلاثاء", تنزيلات: 6 },
    { label: "الأربعاء", تنزيلات: 11 },
    { label: "الخميس", تنزيلات: 9 },
    { label: "الجمعة", تنزيلات: 4 },
    { label: "السبت", تنزيلات: 7 },
  ],
  "month": [
    { label: "الأسبوع 1", تنزيلات: 18 },
    { label: "الأسبوع 2", تنزيلات: 24 },
    { label: "الأسبوع 3", تنزيلات: 21 },
    { label: "الأسبوع 4", تنزيلات: 29 },
  ],
  "3months": [
    { label: "مايو", تنزيلات: 28 },
    { label: "يونيو", تنزيلات: 40 },
    { label: "يوليو", تنزيلات: 36 },
  ],
};

const FILTER_OPTIONS: { key: FilterRange; label: string }[] = [
  { key: "7days", label: "7 أيام" },
  { key: "month", label: "شهر" },
  { key: "3months", label: "3 أشهر" },
];

const CATEGORY_USAGE_BY_RANGE: Record<CategoryFilterRange, { name: string; نماذج: number }[]> = {
  month: [
    { name: "المراسلات", نماذج: 9 },
    { name: "الاجتماعات", نماذج: 7 },
    { name: "التقارير", نماذج: 6 },
    { name: "اللوائح", نماذج: 5 },
    { name: "الموارد", نماذج: 4 },
    { name: "الشؤون", نماذج: 3 },
    { name: "الشراكات", نماذج: 3 },
    { name: "الشكر", نماذج: 2 },
  ],
  quarter: [
    { name: "المراسلات", نماذج: 24 },
    { name: "الاجتماعات", نماذج: 20 },
    { name: "التقارير", نماذج: 18 },
    { name: "اللوائح", نماذج: 15 },
    { name: "الموارد", نماذج: 13 },
    { name: "الشؤون", نماذج: 10 },
    { name: "الشراكات", نماذج: 9 },
    { name: "الشكر", نماذج: 7 },
  ],
  year: CATEGORIES.map((c) => ({
    name: c.label.length > 7 ? c.label.slice(0, 7) + "…" : c.label,
    نماذج: c.count,
  })).sort((a, b) => b.نماذج - a.نماذج),
};

const CATEGORY_FILTER_OPTIONS: { key: CategoryFilterRange; label: string }[] = [
  { key: "month", label: "شهر" },
  { key: "quarter", label: "ربع سنة" },
  { key: "year", label: "سنة" },
];

const ACTIVITY = [
  { action: "تم تنزيل نموذج", target: "محضر اجتماع مجلس الإدارة", time: "منذ 5 دقائق", type: "download" },
  { action: "تم تنزيل نموذج", target: "اللائحة الداخلية للجمعية الأهلية", time: "منذ 12 دقيقة", type: "download" },
  { action: "تم تنزيل نموذج", target: "خطاب تعريف بالجمعية", time: "منذ 20 دقيقة", type: "download" },
  { action: "تم تنزيل نموذج", target: "التقرير السنوي للجمعية", time: "منذ 31 دقيقة", type: "download" },
  { action: "تم تنزيل نموذج", target: "مذكرة تفاهم بين جمعيتين", time: "منذ 47 دقيقة", type: "download" },
  { action: "تم تنزيل نموذج", target: "الميزانية التقديرية السنوية", time: "منذ 58 دقيقة", type: "download" },
];

const STAT_CARDS = [
  {
    label: "إجمالي النماذج",
    value: STATS.templates.toString(),
    icon: FileText,
    change: "+12",
    up: true,
    color: "bg-blue-50 text-blue-600",
    border: "border-blue-100",
  },
  {
    label: "التنزيلات",
    value: STATS.downloads.toString(),
    icon: Download,
    change: "+8",
    up: true,
    color: "bg-teal-50 text-teal-600",
    border: "border-teal-100",
  },
  {
    label: "العملاء",
    value: STATS.associations.toString(),
    icon: Users,
    change: "+5",
    up: true,
    color: "bg-indigo-50 text-indigo-600",
    border: "border-indigo-100",
  },
  {
    label: "التصنيفات",
    value: CATEGORIES.length.toString(),
    icon: TrendingUp,
    change: "0",
    up: null,
    color: "bg-amber-50 text-amber-600",
    border: "border-amber-100",
  },
];

const DEMO_MESSAGES: ContactMessage[] = [
  { id: "demo-1", name: "أحمد الزهراني", email: "ahmed@npo.sa", phone: "0501234567", subject: "استفسار عن نموذج", message: "أريد الاستفسار عن نموذج محضر اجتماع مجلس الإدارة وهل يمكن تعديله.", sentAt: new Date(Date.now() - 25 * 60000).toISOString(), read: true },
  { id: "demo-2", name: "سارة المالكي", email: "sara@ngo.org", phone: "", subject: "مشكلة في الدفع أو التنزيل", message: "واجهت مشكلة عند محاولة تنزيل النموذج بعد الدفع. الصفحة لا تستجيب.", sentAt: new Date(Date.now() - 2 * 3600000).toISOString(), read: false },
  { id: "demo-3", name: "محمد العمري", email: "m.omari@charity.sa", phone: "0557654321", subject: "طلب نموذج جديد", message: "هل يمكن إضافة نموذج خطة استراتيجية خمسية للجمعية؟", sentAt: new Date(Date.now() - 5 * 3600000).toISOString(), read: false },
  { id: "demo-4", name: "نوف القحطاني", email: "nof@assoc.sa", phone: "", subject: "شراكة أو تعاون مؤسسي", message: "نودّ التواصل بشأن إمكانية الشراكة مع منصة عزم في تدريب الجمعيات.", sentAt: new Date(Date.now() - 18 * 3600000).toISOString(), read: true },
  { id: "demo-5", name: "خالد الدوسري", email: "k.dosari@npo.com", phone: "0509876543", subject: "اقتراح أو ملاحظة", message: "أقترح إضافة ميزة البحث المتقدم بالفلتر المتعدد في صفحة المكتبة.", sentAt: new Date(Date.now() - 30 * 3600000).toISOString(), read: true },
  { id: "demo-6", name: "رنا السبيعي", email: "rana@community.org", phone: "", subject: "دعم فني", message: "الصفحة لا تعمل بشكل صحيح على متصفح الجوال.", sentAt: new Date(Date.now() - 2 * 86400000).toISOString(), read: true },
  { id: "demo-7", name: "عبدالله الشمري", email: "a.shamri@org.sa", phone: "", subject: "استفسار عن نموذج", message: "هل نموذج اللائحة الداخلية متوافق مع متطلبات عام 2026؟", sentAt: new Date(Date.now() - 3 * 86400000).toISOString(), read: true },
  { id: "demo-8", name: "ليلى الحربي", email: "laila@nonprofit.sa", phone: "0531112233", subject: "اقتراح أو ملاحظة", message: "أقترح إضافة نماذج بالإنجليزية لمساعدة الجمعيات في التواصل الدولي.", sentAt: new Date(Date.now() - 4 * 86400000).toISOString(), read: true },
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

function formatRelTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

export default function AdminDashboard() {
  const [downloadsFilter, setDownloadsFilter] = useState<FilterRange>("3months");
  const activeDownloads = DOWNLOADS_BY_RANGE[downloadsFilter];
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterRange>("year");
  const activeCategoryUsage = CATEGORY_USAGE_BY_RANGE[categoryFilter];
  const [storedMessages] = useLocalStorage<ContactMessage[]>("azm_messages", []);
  const [msgFilter, setMsgFilter] = useState<"all" | "unread">("all");
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);

  const allMessages = [...storedMessages, ...DEMO_MESSAGES];
  const displayMessages = msgFilter === "unread" ? allMessages.filter(m => !m.read) : allMessages;
  const unreadCount = allMessages.filter(m => !m.read).length;

  const subjectCounts = allMessages.reduce<Record<string, number>>((acc, msg) => {
    acc[msg.subject] = (acc[msg.subject] || 0) + 1;
    return acc;
  }, {});
  const subjectChartData = Object.entries(subjectCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([subject, count]) => ({
      subject: subject.length > 14 ? subject.slice(0, 14) + "…" : subject,
      fullSubject: subject,
      count,
      fill: SUBJECT_COLORS[subject] ?? "#9ca3af",
    }));

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="font-heading font-bold text-2xl text-[#0B2A4A]">لوحة التحكم</h2>
        <p className="text-gray-500 text-sm mt-1">نظرة عامة على أداء المنصة</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className={`bg-white rounded-xl border ${s.border} p-5`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}>
                <s.icon size={20} strokeWidth={1.75} />
              </div>
              {s.up !== null && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.up ? "text-emerald-600" : "text-red-500"}`}>
                  {s.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {s.change}
                </span>
              )}
            </div>
            <p className="font-heading font-bold text-2xl text-[#0B2A4A]">{s.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Two Columns: Top Templates + Recent Activity */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Top Templates */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm">أكثر النماذج تنزيلاً</h3>
            <a href="/admin/templates" className="text-xs text-teal-600 hover:underline">عرض الكل</a>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTemplates.map((tpl, idx) => (
              <div key={tpl.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <span className="text-xs font-bold text-gray-300 w-5 flex-shrink-0">{String(idx + 1).padStart(2, "0")}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{tpl.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {CATEGORIES.find(c => c.id === tpl.category)?.label ?? tpl.category}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
                  <Download size={13} strokeWidth={1.75} />
                  <span className="text-xs">{tpl.downloads.toLocaleString("ar-SA")}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${tpl.isFeatured ? "bg-teal-50 text-teal-600" : "bg-gray-100 text-gray-400"}`}>
                  {tpl.isFeatured ? "مميز" : "عادي"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm">آخر النشاطات</h3>
            <Clock size={15} className="text-gray-400" />
          </div>
          <div className="divide-y divide-gray-50 overflow-y-auto max-h-80">
            {ACTIVITY.map((act, idx) => (
              <div key={idx} className="flex gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Download size={13} className="text-teal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-gray-800">{act.action}</span>
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{act.target}</p>
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {act.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Messages Card ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <MessageSquare size={16} className="text-indigo-600" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm">رسائل التواصل</h3>
              <p className="text-xs text-gray-400">{allMessages.length} رسالة إجمالاً</p>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} جديدة
              </span>
            )}
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setMsgFilter("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                msgFilter === "all" ? "bg-white text-[#0B2A4A] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              الكل
            </button>
            <button
              onClick={() => setMsgFilter("unread")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                msgFilter === "unread" ? "bg-white text-[#0B2A4A] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              غير مقروءة
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 divide-x divide-x-reverse divide-gray-100">
          {/* Chart — by subject */}
          <div className="lg:col-span-2 p-4 border-b lg:border-b-0">
            <p className="text-xs font-semibold text-gray-500 mb-3">توزيع الرسائل حسب الموضوع</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={subjectChartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barSize={14}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="subject"
                  width={110}
                  tick={{ fontSize: 10, fill: "#6b7280", fontFamily: "Tajawal, sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "11px", fontFamily: "Tajawal, sans-serif" }}
                  formatter={(value: number, _: string, entry: {payload: {fullSubject: string}}) => [value + " رسالة", entry.payload.fullSubject]}
                  cursor={{ fill: "#f3f4f6" }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {subjectChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Legend dots */}
            <div className="mt-2 space-y-1">
              {subjectChartData.slice(0, 4).map((entry) => (
                <div key={entry.fullSubject} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.fill }} />
                  <span className="text-[10px] text-gray-500 truncate">{entry.fullSubject}</span>
                  <span className="text-[10px] font-bold text-gray-700 mr-auto">{entry.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Messages Table */}
          <div className="lg:col-span-3">
            {selectedMsg ? (
              // Message Detail View
              <div className="p-5">
                <button
                  onClick={() => setSelectedMsg(null)}
                  className="flex items-center gap-1 text-xs text-teal-600 hover:underline mb-4">
                  <span>→</span> العودة للقائمة
                </button>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-heading font-semibold text-[#0B2A4A] text-sm">{selectedMsg.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5" dir="ltr">{selectedMsg.email}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{formatRelTime(selectedMsg.sentAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
                      style={{ background: SUBJECT_COLORS[selectedMsg.subject] ?? "#9ca3af" }}>
                      {selectedMsg.subject}
                    </span>
                    {selectedMsg.phone && (
                      <span className="text-xs text-gray-500" dir="ltr">{selectedMsg.phone}</span>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
                    {selectedMsg.message}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <a
                      href={`mailto:${selectedMsg.email}`}
                      className="flex items-center gap-1.5 bg-[#0B2A4A] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#0d3360] transition-colors">
                      الرد عبر البريد
                    </a>
                    {selectedMsg.phone && (
                      <a
                        href={`https://wa.me/966${selectedMsg.phone.replace(/^0/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-teal-100 transition-colors">
                        واتساب
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Messages List
              <div className="divide-y divide-gray-50 max-h-[340px] overflow-y-auto">
                {displayMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <MessageSquare size={32} strokeWidth={1.25} className="mb-2" />
                    <p className="text-sm">لا توجد رسائل</p>
                  </div>
                ) : (
                  displayMessages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => setSelectedMsg(msg)}
                      className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-right group">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B2A4A] to-[#2BB6A3] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{msg.name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate ${msg.read ? "text-gray-700" : "font-semibold text-[#0B2A4A]"}`}>
                            {msg.name}
                          </p>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">{formatRelTime(msg.sentAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white flex-shrink-0"
                            style={{ background: SUBJECT_COLORS[msg.subject] ?? "#9ca3af" }}>
                            {msg.subject.length > 18 ? msg.subject.slice(0, 18) + "…" : msg.subject}
                          </span>
                          {!msg.read && (
                            <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{msg.message}</p>
                      </div>
                      <Eye size={14} className="text-gray-300 group-hover:text-teal-500 transition-colors flex-shrink-0 mt-1" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer stats */}
        <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="font-heading font-bold text-lg text-[#0B2A4A]">{allMessages.length}</p>
            <p className="text-[10px] text-gray-400">إجمالي الرسائل</p>
          </div>
          <div className="text-center">
            <p className="font-heading font-bold text-lg text-red-500">{unreadCount}</p>
            <p className="text-[10px] text-gray-400">غير مقروءة</p>
          </div>
          <div className="text-center">
            <p className="font-heading font-bold text-lg text-emerald-600">{allMessages.length - unreadCount}</p>
            <p className="text-[10px] text-gray-400">تمت قراءتها</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart — Downloads with Filter */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm">التنزيلات</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {downloadsFilter === "7days" ? "آخر 7 أيام" : downloadsFilter === "month" ? "خلال الشهر الحالي" : "آخر 3 أشهر"}
              </p>
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setDownloadsFilter(opt.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    downloadsFilter === opt.key
                      ? "bg-white text-[#0B2A4A] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={activeDownloads} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Tajawal, sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Tajawal, sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontFamily: "Tajawal, sans-serif",
                  }}
                  cursor={{ stroke: "#2BB6A3", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Line
                  type="monotone"
                  dataKey="تنزيلات"
                  stroke="#2BB6A3"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#2BB6A3", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#0B2A4A" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart — Category Usage */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm">أكثر التصنيفات استخداماً</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {categoryFilter === "month" ? "خلال الشهر الحالي" : categoryFilter === "quarter" ? "خلال الربع الحالي" : "خلال السنة الحالية"}
              </p>
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {CATEGORY_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setCategoryFilter(opt.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    categoryFilter === opt.key
                      ? "bg-white text-[#0B2A4A] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activeCategoryUsage} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#9ca3af", fontFamily: "Tajawal, sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Tajawal, sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontFamily: "Tajawal, sans-serif",
                  }}
                  cursor={{ fill: "#f0fdf9" }}
                />
                <Bar dataKey="نماذج" fill="#0B2A4A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
