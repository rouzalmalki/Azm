import { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Download,
  TrendingUp,
  Award,
  Layers,
  RefreshCw,
  Database,
  Medal,
  FileDown,
} from "lucide-react";
import { TEMPLATES, CATEGORIES } from "@/constants/data";
import {
  fetchTopDownloaded,
  fetchDownloadsByCategory,
  fetchTotalDownloads,
  type Period,
  type TopDownloaded,
  type CategoryStat,
} from "@/lib/tracking";

// ─── Period Options ───────────────────────────────────────────────────────────
const PERIOD_OPTIONS: { id: Period; label: string }[] = [
  { id: "7d", label: "٧ أيام" },
  { id: "30d", label: "٣٠ يوماً" },
  { id: "90d", label: "٣ أشهر" },
];

// Category label lookup from local data
const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label])
);

// Template → category map built from local TEMPLATES
const TEMPLATE_CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, CATEGORY_LABELS[t.category] ?? t.category])
);

// Bar chart colours for categories
const BAR_COLORS = [
  "#2BB6A3", "#0B2A4A", "#3B82F6", "#8B5CF6",
  "#F59E0B", "#EF4444", "#10B981", "#F97316", "#6366F1",
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} mb-3`}>
        <Icon size={18} className={color} strokeWidth={1.75} />
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-7 w-20 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
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

// ─── Category Bar Chart ────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-[#0B2A4A] mb-1.5">{label}</p>
      <p className="text-teal-600">
        تنزيلات: <strong>{payload[0]?.value?.toLocaleString("ar-SA")}</strong>
      </p>
      {payload[1] && (
        <p className="text-blue-500">
          مشاهدات: <strong>{payload[1]?.value?.toLocaleString("ar-SA")}</strong>
        </p>
      )}
    </div>
  );
};

function CategoryChart({ data, loading }: { data: CategoryStat[]; loading: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm mb-1">
        التنزيلات حسب التصنيف
      </h3>
      <p className="text-xs text-gray-400 mb-5">مقارنة بين جميع التصنيفات</p>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw size={22} className="text-gray-300 animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <Database size={28} className="text-gray-200" />
          <p className="text-xs text-gray-400">لا توجد بيانات في هذه الفترة بعد</p>
          <p className="text-[11px] text-gray-300">ستظهر البيانات فور بدء التنزيلات</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="category"
              type="category"
              width={110}
              tick={{ fontSize: 11, fill: "#374151" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="downloads" radius={[0, 6, 6, 0]} barSize={18}>
              {data.map((_, idx) => (
                <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ─── Medal badge ──────────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Medal size={16} className="text-amber-500" />;
  if (rank === 2) return <Medal size={16} className="text-gray-400" />;
  if (rank === 3) return <Medal size={16} className="text-amber-700" />;
  return (
    <span className="text-xs font-bold text-gray-400 w-5 text-center inline-block">
      {rank}
    </span>
  );
}

// ─── CSV Export ──────────────────────────────────────────────────────────────
function exportPerformanceCSV(
  topDownloaded: TopDownloaded[],
  categoryStats: CategoryStat[],
  period: Period,
  templateCategoryMap: Record<string, string>
) {
  const BOM = "\uFEFF";
  const periodLabel = period === "7d" ? "٧ أيام" : period === "30d" ? "٣٠ يوماً" : "٣ أشهر";

  const escape = (val: string | number) => {
    const s = String(val);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const toBlock = (rows: (string | number)[][]): string =>
    rows.map((r) => r.map(escape).join(",")).join("\n");

  // Section 1: top templates
  const templateRows: (string | number)[][] = [
    ["الترتيب", "اسم النموذج", "التصنيف", "التنزيلات", "المشاهدات", "معدل التحويل (%)"],
    ...topDownloaded.map((item, idx) => [
      idx + 1,
      item.template_title,
      templateCategoryMap[item.template_id] ?? "—",
      item.downloads,
      item.views,
      item.conversionRate,
    ]),
  ];

  // Section 2: category stats
  const categoryRows: (string | number)[][] = [
    ["التصنيف", "التنزيلات"],
    ...categoryStats.map((c) => [c.category, c.downloads]),
  ];

  const content = [
    `=== تقرير الأداء — آخر ${periodLabel} ===`,
    "",
    "=== النماذج الأكثر تنزيلاً ===",
    toBlock(templateRows),
    "",
    "=== التنزيلات حسب التصنيف ===",
    toBlock(categoryRows),
  ].join("\n");

  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `تقرير-الأداء-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPerformance() {
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const [totalDownloads, setTotalDownloads] = useState(0);
  const [topDownloaded, setTopDownloaded] = useState<TopDownloaded[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [total, top, cats] = await Promise.all([
      fetchTotalDownloads(period),
      fetchTopDownloaded(period),
      fetchDownloadsByCategory(period, TEMPLATE_CATEGORY_MAP),
    ]);
    setTotalDownloads(total);
    setTopDownloaded(top);
    setCategoryStats(cats);
    setLastRefresh(new Date());
    setLoading(false);
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const topCategory = categoryStats[0]?.category ?? "—";
  const maxDownloads = topDownloaded[0]?.downloads ?? 1;
  const avgConversion =
    topDownloaded.length > 0
      ? Math.round(
          topDownloaded.reduce((s, t) => s + t.conversionRate, 0) / topDownloaded.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="font-heading font-bold text-2xl text-[#0B2A4A]">تقرير الأداء</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            بيانات التنزيلات الحقيقية من قاعدة البيانات
            {!loading && (
              <span className="mr-2 text-gray-400 text-xs">
                · آخر تحديث:{" "}
                {lastRefresh.toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all disabled:opacity-40"
            title="تحديث"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          {!loading && topDownloaded.length > 0 && (
            <button
              onClick={() =>
                exportPerformanceCSV(topDownloaded, categoryStats, period, TEMPLATE_CATEGORY_MAP)
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2A4A] text-white text-xs font-medium hover:bg-[#0d3260] transition-colors"
            >
              <FileDown size={13} />
              تصدير CSV
            </button>
          )}
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
        بيانات حقيقية من جدول{" "}
        <code className="bg-teal-100 px-1 rounded font-mono">template_views</code> في
        OnSpace Cloud
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Download}
          label="إجمالي التنزيلات"
          value={totalDownloads.toLocaleString("ar-SA")}
          sub="ملف تم تنزيله في الفترة"
          color="text-teal-600"
          bg="bg-teal-50"
          loading={loading}
        />
        <StatCard
          icon={Layers}
          label="أكثر التصنيفات تنزيلاً"
          value={topCategory}
          sub={
            categoryStats[0]
              ? `${categoryStats[0].downloads.toLocaleString("ar-SA")} تنزيل`
              : "لا توجد بيانات"
          }
          color="text-blue-600"
          bg="bg-blue-50"
          loading={loading}
        />
        <StatCard
          icon={TrendingUp}
          label="متوسط معدل التحويل"
          value={`${avgConversion}%`}
          sub="للنماذج الأكثر تنزيلاً"
          color="text-violet-600"
          bg="bg-violet-50"
          loading={loading}
        />
      </div>

      {/* ── Charts + Table ── */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Bar Chart — 3 cols */}
        <div className="lg:col-span-3">
          <CategoryChart data={categoryStats} loading={loading} />
        </div>

        {/* Top Downloaded mini-list — 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
          <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm mb-1">
            أبرز النماذج
          </h3>
          <p className="text-xs text-gray-400 mb-4">الأكثر تنزيلاً في الفترة</p>

          {loading ? (
            <div className="space-y-3 flex-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-100 rounded animate-pulse" />
                  <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="w-8 h-4 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : topDownloaded.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <Database size={28} className="text-gray-200" />
              <p className="text-xs text-gray-400 text-center">
                لا توجد تنزيلات بعد في هذه الفترة
              </p>
            </div>
          ) : (
            <div className="space-y-2 flex-1 overflow-y-auto">
              {topDownloaded.slice(0, 6).map((item, idx) => (
                <div
                  key={item.template_id}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-6 flex-shrink-0 flex items-center justify-center">
                    <RankBadge rank={idx + 1} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 line-clamp-1">
                      {item.template_title}
                    </p>
                    <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-teal-400 rounded-full"
                        style={{
                          width: `${Math.round((item.downloads / maxDownloads) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#0B2A4A] flex-shrink-0">
                    {item.downloads.toLocaleString("ar-SA")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Full Ranking Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Award size={16} className="text-teal-500" />
          <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm">
            ترتيب النماذج الأكثر تنزيلاً
          </h3>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <RefreshCw size={22} className="text-gray-300 animate-spin" />
          </div>
        ) : topDownloaded.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <Database size={32} className="text-gray-200" />
            <p className="text-sm text-gray-400 font-medium">لا توجد بيانات بعد</p>
            <p className="text-xs text-gray-300 max-w-xs text-center leading-relaxed">
              ستبدأ البيانات بالظهور فور قيام المستخدمين بتنزيل النماذج
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/60">
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 w-8">
                    #
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">
                    النموذج
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">
                    التصنيف
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">
                    التنزيلات
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">
                    المشاهدات
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">
                    معدل التحويل
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topDownloaded.map((item, idx) => {
                  const templateLocal = TEMPLATES.find(
                    (t) => t.id === item.template_id
                  );
                  const catLabel = templateLocal
                    ? CATEGORY_LABELS[templateLocal.category] ?? templateLocal.category
                    : "—";

                  const convColor =
                    item.conversionRate >= 60
                      ? "text-emerald-600 bg-emerald-50"
                      : item.conversionRate >= 30
                      ? "text-amber-600 bg-amber-50"
                      : "text-red-500 bg-red-50";

                  return (
                    <tr
                      key={item.template_id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 w-8">
                        <div className="flex items-center justify-center">
                          <RankBadge rank={idx + 1} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-gray-800 text-sm line-clamp-1">
                          {item.template_title}
                        </p>
                        <div className="w-32 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-teal-400 rounded-full"
                            style={{
                              width: `${Math.round(
                                (item.downloads / maxDownloads) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center hidden md:table-cell">
                        <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full">
                          {catLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-sm font-bold text-[#0B2A4A]">
                          {item.downloads.toLocaleString("ar-SA")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                        <span className="text-xs text-gray-500">
                          {item.views.toLocaleString("ar-SA")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${convColor}`}
                        >
                          {item.conversionRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
