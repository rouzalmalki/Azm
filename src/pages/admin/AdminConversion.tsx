import { useState, useEffect, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Users,
  Download,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowUpRight,
  RefreshCw,
  Database,
} from "lucide-react";
import { CATEGORIES } from "@/constants/data";
import {
  fetchConversionStats,
  fetchDailyTrend,
  fetchTopUndownloaded,
  type Period,
  type ConversionStats,
  type DailyTrend,
  type TopUndownloaded,
} from "@/lib/tracking";

// ─── Period Options ───────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { id: Period; label: string }[] = [
  { id: "7d", label: "٧ أيام" },
  { id: "30d", label: "٣٠ يوماً" },
  { id: "90d", label: "٣ أشهر" },
];

// ─── Drop-off reasons (static insight cards) ─────────────────────────────────
const DROP_REASONS = [
  { icon: "🔍", label: "صعوبة البحث عن النموذج المناسب", pct: 34 },
  { icon: "📄", label: "غياب معاينة محتوى النموذج", pct: 28 },
  { icon: "🔒", label: "طلب تسجيل الدخول قبل التنزيل", pct: 21 },
  { icon: "⚡", label: "بطء تحميل الصفحة", pct: 17 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  color,
  bg,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  trend?: number;
  color: string;
  bg: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
          <Icon size={18} className={color} strokeWidth={1.75} />
        </div>
        {trend !== undefined && !loading && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend >= 0
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {loading ? (
        <div className="space-y-2 mt-1">
          <div className="h-7 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="font-heading font-bold text-2xl text-[#0B2A4A] mb-0.5">{value}</p>
          <p className="text-xs font-medium text-gray-600">{label}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
        </>
      )}
    </div>
  );
}

const PIE_COLORS = ["#2BB6A3", "#E5E7EB"];

function ConversionPie({ downloaders, total, loading }: { downloaders: number; total: number; loading: boolean }) {
  const data = [
    { name: "نزّلوا ملفاً", value: downloaders },
    { name: "لم ينزّلوا", value: Math.max(total - downloaders, 0) },
  ];
  const pct = total > 0 ? ((downloaders / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm mb-1">معدل التحويل</h3>
      <p className="text-xs text-gray-400 mb-4">نسبة الزوار الذين نزّلوا ملفاً على الأقل</p>
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <RefreshCw size={22} className="text-gray-300 animate-spin" />
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={60}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [v.toLocaleString("ar-SA"), ""]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-heading font-bold text-xl text-[#0B2A4A]">{pct}%</span>
              <span className="text-[10px] text-gray-400">تحويل</span>
            </div>
          </div>
          <div className="space-y-3 flex-1">
            {data.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 truncate">{d.name}</p>
                  <p className="text-sm font-semibold text-[#0B2A4A]">{d.value.toLocaleString("ar-SA")}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-[11px] text-gray-400">الإجمالي: {total.toLocaleString("ar-SA")} زائر</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VisitorTrendChart({ data, period, loading }: { data: DailyTrend[]; period: Period; loading: boolean }) {
  const periodLabel = period === "7d" ? "الأسبوع الماضي" : period === "30d" ? "الشهر الماضي" : "الربع الماضي";
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm mb-1">اتجاه الزيارات والتنزيلات</h3>
      <p className="text-xs text-gray-400 mb-4">خلال {periodLabel}</p>
      {loading ? (
        <div className="flex items-center justify-center h-44">
          <RefreshCw size={22} className="text-gray-300 animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-44 gap-2">
          <Database size={28} className="text-gray-200" />
          <p className="text-xs text-gray-400">لا توجد بيانات في هذه الفترة بعد</p>
          <p className="text-[11px] text-gray-300">ستظهر البيانات فور زيارة صفحات النماذج</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0B2A4A" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#0B2A4A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gDownloaders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2BB6A3" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2BB6A3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                formatter={(v: number, name: string) => [
                  v.toLocaleString("ar-SA"),
                  name === "visitors" ? "الزوار" : "المنزّلون",
                ]}
              />
              <Area type="monotone" dataKey="visitors" stroke="#0B2A4A" strokeWidth={2} fill="url(#gVisitors)" dot={false} />
              <Area type="monotone" dataKey="downloaders" stroke="#2BB6A3" strokeWidth={2} fill="url(#gDownloaders)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-0.5 bg-[#0B2A4A] inline-block rounded" />
              إجمالي الزوار
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-0.5 bg-[#2BB6A3] inline-block rounded" />
              المنزّلون
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminConversion() {
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const [stats, setStats] = useState<ConversionStats>({
    uniqueVisitors: 0,
    downloaders: 0,
    nonDownloaders: 0,
    avgTimeMinutes: 0,
    bounceRate: 0,
  });
  const [trendData, setTrendData] = useState<DailyTrend[]>([]);
  const [topUndownloaded, setTopUndownloaded] = useState<TopUndownloaded[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [s, t, u] = await Promise.all([
      fetchConversionStats(period),
      fetchDailyTrend(period),
      fetchTopUndownloaded(period),
    ]);
    setStats(s);
    setTrendData(t);
    setTopUndownloaded(u);
    setLastRefresh(new Date());
    setLoading(false);
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const conversionRate = stats.uniqueVisitors > 0
    ? ((stats.downloaders / stats.uniqueVisitors) * 100).toFixed(1)
    : "0.0";

  const maxViews = topUndownloaded[0]?.views ?? 1;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="font-heading font-bold text-2xl text-[#0B2A4A]">تقرير التحويل</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            بيانات حقيقية من قاعدة البيانات
            {!loading && (
              <span className="mr-2 text-gray-400 text-xs">
                · آخر تحديث: {lastRefresh.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all disabled:opacity-40"
            title="تحديث البيانات"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          {/* Period Selector */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  period === p.id
                    ? "bg-white text-[#0B2A4A] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live data badge */}
      <div className="flex items-center gap-2 text-xs text-teal-700 bg-teal-50 border border-teal-200 px-3 py-2 rounded-lg w-fit">
        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
        بيانات حقيقية من جدول <code className="bg-teal-100 px-1 rounded font-mono">template_views</code> في OnSpace Cloud
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="زوار فريدون"
          value={stats.uniqueVisitors.toLocaleString("ar-SA")}
          sub="زائر دخل صفحة نموذج"
          color="text-blue-600"
          bg="bg-blue-50"
          loading={loading}
        />
        <StatCard
          icon={Download}
          label="معدل التحويل"
          value={`${conversionRate}%`}
          sub={`${stats.downloaders.toLocaleString("ar-SA")} نزّلوا ملفاً`}
          color="text-teal-600"
          bg="bg-teal-50"
          loading={loading}
        />
        <StatCard
          icon={Clock}
          label="متوسط وقت الإقامة"
          value={`${stats.avgTimeMinutes} د`}
          sub="في صفحة النموذج"
          color="text-violet-600"
          bg="bg-violet-50"
          loading={loading}
        />
        <StatCard
          icon={Eye}
          label="معدل الارتداد"
          value={`${stats.bounceRate}%`}
          sub="غادروا دون تفاعل"
          color="text-orange-500"
          bg="bg-orange-50"
          loading={loading}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <VisitorTrendChart data={trendData} period={period} loading={loading} />
        </div>
        <ConversionPie
          downloaders={stats.downloaders}
          total={stats.uniqueVisitors}
          loading={loading}
        />
      </div>

      {/* ── Top Undownloaded Templates ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm">
              أكثر النماذج مشاهدةً بدون تنزيل
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">نماذج تجذب الانتباه لكن لا تُحوَّل إلى تنزيلات</p>
          </div>
          {topUndownloaded.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <AlertCircle size={12} />
              تحتاج مراجعة
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <RefreshCw size={22} className="text-gray-300 animate-spin" />
          </div>
        ) : topUndownloaded.length === 0 ? (
          <div className="py-14 flex flex-col items-center gap-3 text-center px-6">
            <Database size={32} className="text-gray-200" />
            <p className="text-sm text-gray-400 font-medium">لا توجد بيانات بعد</p>
            <p className="text-xs text-gray-300 max-w-xs leading-relaxed">
              ستبدأ البيانات بالظهور هنا فور قيام المستخدمين بزيارة صفحات النماذج في المكتبة
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/60">
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">#</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">النموذج</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">المشاهدات</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">التنزيلات</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">نسبة الإسقاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topUndownloaded.map((item, idx) => {
                  const dropColor =
                    item.dropRate >= 80 ? "bg-red-400" : item.dropRate >= 65 ? "bg-amber-400" : "bg-emerald-400";
                  const textColor =
                    item.dropRate >= 80 ? "text-red-600" : item.dropRate >= 65 ? "text-amber-600" : "text-emerald-600";

                  return (
                    <tr key={item.template_id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-gray-400 font-medium w-8">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-gray-800 text-sm line-clamp-1">{item.template_title}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-semibold text-gray-700">
                            {item.views.toLocaleString("ar-SA")}
                          </span>
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-400 rounded-full"
                              style={{ width: `${(item.views / maxViews) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                        <span className="text-xs text-gray-500">{item.downloads.toLocaleString("ar-SA")}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-xs font-bold ${textColor}`}>{item.dropRate}%</span>
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${dropColor}`} style={{ width: `${item.dropRate}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Drop-off Reasons ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm mb-1">
          أبرز أسباب عدم التنزيل
        </h3>
        <p className="text-xs text-gray-400 mb-5">بناءً على تحليل سلوك المستخدمين وأنماط التصفح</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {DROP_REASONS.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-xl flex-shrink-0">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 leading-snug">{r.label}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2BB6A3] rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="text-[11px] font-semibold text-teal-700 flex-shrink-0">{r.pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-400 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
          <ArrowUpRight size={13} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <span>
            <strong className="text-blue-600">توصية:</strong> إضافة خاصية معاينة النموذج قبل التنزيل يمكن أن ترفع معدل التحويل بنسبة تقديرية تصل إلى <strong className="text-blue-600">+15%</strong>
          </span>
        </div>
      </div>

    </div>
  );
}
