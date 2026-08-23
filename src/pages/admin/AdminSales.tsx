import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Trophy,
  FileDown,
  PieChart as PieIcon,
  CalendarDays,
  ClipboardList,
  Copy,
  Check,
  X,
  Search,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { adminTokenStore } from "@/lib/adminToken";

interface KPI {
  totalRevenue: number;
  totalTransactions: number;
  avgCartValue: number;
  monthRevenue: number;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  transactions: number;
}

interface MonthlyRevenue {
  month: string;
  label: string;
  revenue: number;
  transactions: number;
}

interface TemplateRevenue {
  templateTitle: string;
  templateId: string;
  units: number;
  revenue: number;
}

interface RecentTransaction {
  id: string;
  cardName: string;
  cardCompany: string;
  sourceType: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface PaymentMethodCount {
  method: string;
  label: string;
  count: number;
  revenue: number;
}

interface SalesReport {
  kpi: KPI;
  dailyRevenue: DailyRevenue[];
  monthlyRevenue: MonthlyRevenue[];
  topTemplates: TemplateRevenue[];
  paymentMethods: PaymentMethodCount[];
  recentTransactions: RecentTransaction[];
  period: number;
}

const PERIOD_OPTIONS = [
  { label: "٧ أيام", value: 7 },
  { label: "٣٠ يوم", value: 30 },
  { label: "٩٠ يوم", value: 90 },
];

// Colors per payment method
const METHOD_COLORS: Record<string, string> = {
  mada: "#006B45",
  visa: "#1A1F71",
  mastercard: "#EB001B",
  applepay: "#111111",
  stcpay: "#6B0E8C",
  other: "#9CA3AF",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-SA", { month: "short", day: "numeric" });
}

function formatSAR(amount: number): string {
  return amount.toLocaleString("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function exportToCSV(report: SalesReport) {
  const BOM = "\uFEFF";

  const dailyRows = [
    ["التاريخ", "الإيرادات (ر.س)", "عدد المعاملات"],
    ...report.dailyRevenue.map((d) => [d.date, d.revenue.toFixed(2), d.transactions]),
    [],
    ["الإجمالي", report.kpi.totalRevenue.toFixed(2), report.kpi.totalTransactions],
  ];

  const templateRows = [
    ["الترتيب", "اسم النموذج", "عدد النسخ المباعة", "الإيراد (ر.س)"],
    ...report.topTemplates.map((t, i) => [i + 1, t.templateTitle, t.units, t.revenue.toFixed(2)]),
  ];

  const methodRows = [
    ["طريقة الدفع", "عدد المعاملات", "الإيراد (ر.س)", "النسبة (%)"],
    ...report.paymentMethods.map((m) => [
      m.label,
      m.count,
      m.revenue.toFixed(2),
      report.kpi.totalTransactions > 0
        ? ((m.count / report.kpi.totalTransactions) * 100).toFixed(1)
        : "0",
    ]),
  ];

  const summaryRows = [
    ["المؤشر", "القيمة"],
    ["إجمالي الإيرادات", `${report.kpi.totalRevenue.toFixed(2)} ر.س`],
    ["إيرادات هذا الشهر", `${report.kpi.monthRevenue.toFixed(2)} ر.س`],
    ["عدد المعاملات", report.kpi.totalTransactions],
    ["متوسط قيمة السلة", `${report.kpi.avgCartValue.toFixed(2)} ر.س`],
    ["الفترة الزمنية", `آخر ${report.period} يوم`],
  ];

  const escape = (val: string | number) => {
    const s = String(val);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const toBlock = (rows: (string | number)[][]): string =>
    rows.map((r) => r.map(escape).join(",")).join("\n");

  const content = [
    "=== ملخص المؤشرات ===",
    toBlock(summaryRows),
    "",
    "=== طرق الدفع ===",
    toBlock(methodRows),
    "",
    "=== الإيرادات اليومية ===",
    toBlock(dailyRows),
    "",
    "=== النماذج الأكثر مبيعاً ===",
    toBlock(templateRows),
  ].join("\n");

  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `تقرير-المبيعات-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Card info helper
function getCardInfo(company: string, sourceType: string) {
  const c = (company || sourceType || "").toLowerCase();
  if (c.includes("mada") || c === "mada") return { label: "مدى",         color: "#006B45", bg: "#E6F4EF", abbr: "مدى" };
  if (c.includes("visa"))              return { label: "Visa",          color: "#1A1F71", bg: "#EEF0FA", abbr: "VISA" };
  if (c.includes("master"))            return { label: "Mastercard",    color: "#EB001B", bg: "#FEF0F0", abbr: "MC" };
  if (c.includes("amex") || c.includes("american")) return { label: "Amex", color: "#006FCF", bg: "#EBF5FF", abbr: "AMEX" };
  if (c.includes("apple"))             return { label: "Apple Pay",     color: "#000000", bg: "#F5F5F5", abbr: "AP" };
  if (c.includes("stc"))               return { label: "STC Pay",       color: "#6B0E8C", bg: "#F5EBF9", abbr: "STC" };
  return                                      { label: "بطاقة بنكية",  color: "#0B2A4A", bg: "#EBF0F6", abbr: "Card" };
}

// Status label + color
function getStatusBadge(status: string) {
  switch (status) {
    case "paid":       return { label: "مدفوع",    cls: "bg-emerald-50 text-emerald-600 border-emerald-200" };
    case "authorized": return { label: "مُعتمد",   cls: "bg-blue-50 text-blue-600 border-blue-200" };
    case "failed":     return { label: "فشل",       cls: "bg-red-50 text-red-500 border-red-200" };
    case "refunded":   return { label: "مُسترجع",  cls: "bg-purple-50 text-purple-600 border-purple-200" };
    case "voided":     return { label: "ملغي",      cls: "bg-gray-50 text-gray-500 border-gray-200" };
    case "initiated":  return { label: "بانتظار",  cls: "bg-amber-50 text-amber-600 border-amber-200" };
    default:           return { label: status,      cls: "bg-gray-50 text-gray-500 border-gray-200" };
  }
}

// Copy-to-clipboard hook
function useCopy() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };
  return { copiedId, copy };
}

// Custom Pie label
const renderPieLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number; percent: number;
}) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 700 }}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

export default function AdminSales() {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(30);
  const { copiedId, copy } = useCopy();

  // Transaction filter state
  const [txSearch, setTxSearch] = useState("");
  const [txStatus, setTxStatus] = useState("all");
  const [txMethod, setTxMethod] = useState("all");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);

    // get-sales-report محمية بـ Admin Token (من الذاكرة فقط، لا يُكشف في البundلe)
    const adminToken = adminTokenStore.get() ?? "";
    const { data, error: fnError } = await supabase.functions.invoke(
      "get-sales-report",
      {
        body: { days: period },
        headers: { "x-admin-token": adminToken },
      }
    );

    if (fnError) {
      let msg = fnError.message;
      if (fnError instanceof FunctionsHttpError) {
        try { msg = (await fnError.context?.text()) || msg; } catch { /* ignore */ }
      }
      console.error("[sales-report]", msg);
      setError(msg);
      setLoading(false);
      return;
    }

    setReport(data as SalesReport);
    setLoading(false);
  }, [period]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const kpiCards = report
    ? [
        {
          label: "إجمالي الإيرادات",
          value: `${formatSAR(report.kpi.totalRevenue)} ر.س`,
          icon: DollarSign,
          color: "bg-emerald-50 text-emerald-600",
          border: "border-emerald-200",
        },
        {
          label: "إيرادات هذا الشهر",
          value: `${formatSAR(report.kpi.monthRevenue)} ر.س`,
          icon: TrendingUp,
          color: "bg-blue-50 text-blue-600",
          border: "border-blue-200",
        },
        {
          label: "عدد المعاملات",
          value: report.kpi.totalTransactions.toLocaleString("ar-SA"),
          icon: CreditCard,
          color: "bg-purple-50 text-purple-600",
          border: "border-purple-200",
        },
        {
          label: "متوسط قيمة السلة",
          value: `${formatSAR(report.kpi.avgCartValue)} ر.س`,
          icon: ShoppingBag,
          color: "bg-amber-50 text-amber-600",
          border: "border-amber-200",
        },
      ]
    : [];

  const maxUnits = report?.topTemplates[0]?.units ?? 1;
  const totalMethodCount = report?.paymentMethods.reduce((s, m) => s + m.count, 0) ?? 0;

  // Filtered transactions derived from report
  const filteredTransactions = (report?.recentTransactions ?? []).filter((tx) => {
    if (txStatus !== "all" && tx.status !== txStatus) return false;
    if (txMethod !== "all") {
      const c = (tx.cardCompany + " " + tx.sourceType).toLowerCase();
      if (txMethod === "mada"       && !c.includes("mada"))   return false;
      if (txMethod === "visa"       && !c.includes("visa"))   return false;
      if (txMethod === "mastercard" && !c.includes("master")) return false;
      if (txMethod === "applepay"   && !c.includes("apple"))  return false;
      if (txMethod === "stcpay"     && !c.includes("stc"))    return false;
    }
    if (txSearch.trim()) {
      const q = txSearch.trim().toLowerCase();
      if (!tx.cardName.toLowerCase().includes(q) && !tx.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filtersActive = txSearch.trim() !== "" || txStatus !== "all" || txMethod !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-xl text-[#0B2A4A]">تقرير المبيعات</h1>
          <p className="text-sm text-gray-400 mt-0.5">إيرادات Moyasar وتحليل طرق الدفع</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden text-sm">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  period === opt.value
                    ? "bg-[#0B2A4A] text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            تحديث
          </button>
          {report && (
            <button
              onClick={() => exportToCSV(report)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2A4A] text-white text-sm font-medium hover:bg-[#0d3260] transition-colors"
            >
              <FileDown size={14} />
              تصدير CSV
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">تعذّر تحميل بيانات Moyasar</p>
            <p className="text-red-400 mt-0.5 text-xs font-mono">{error}</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
              <div className="h-7 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : report ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card) => (
            <div
              key={card.label}
              className={`bg-white rounded-xl border ${card.border} p-5 flex flex-col gap-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                  <card.icon size={15} strokeWidth={2} />
                </div>
              </div>
              <p className="font-heading font-bold text-xl text-[#0B2A4A] leading-none">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Revenue Area Chart */}
      {report && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-heading font-semibold text-sm text-[#0B2A4A] mb-4 flex items-center gap-2">
            <TrendingUp size={15} strokeWidth={1.75} className="text-[#2BB6A3]" />
            الإيرادات اليومية (آخر {period} يوم)
          </h2>
          {report.dailyRevenue.every((d) => d.revenue === 0) ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              لا توجد مبيعات في هذه الفترة
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={report.dailyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2BB6A3" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2BB6A3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={formatDate}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false}
                  interval={period <= 7 ? 0 : period <= 30 ? 4 : 9} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${v}`} width={35} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px", direction: "rtl" }}
                  formatter={(val: number) => [`${formatSAR(val)} ر.س`, "الإيراد"]}
                  labelFormatter={formatDate}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2BB6A3" strokeWidth={2}
                  fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: "#2BB6A3" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Payment Methods + Monthly Revenue */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* ── Payment Methods Pie ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-heading font-semibold text-sm text-[#0B2A4A] mb-4 flex items-center gap-2">
              <PieIcon size={15} strokeWidth={1.75} className="text-[#2BB6A3]" />
              طرق الدفع
            </h2>

            {report.paymentMethods.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                لا توجد بيانات دفع في هذه الفترة
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Pie chart */}
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={report.paymentMethods}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={38}
                      labelLine={false}
                      label={renderPieLabel}
                    >
                      {report.paymentMethods.map((entry) => (
                        <Cell
                          key={entry.method}
                          fill={METHOD_COLORS[entry.method] ?? "#9CA3AF"}
                        />
                      ))}
                    </Pie>
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ fontSize: 11, color: "#374151" }}>{value}</span>
                      )}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px", direction: "rtl" }}
                      formatter={(val: number, _name: string, props: { payload?: PaymentMethodCount }) => {
                        const method = props.payload;
                        const pct = totalMethodCount > 0 ? ((val / totalMethodCount) * 100).toFixed(1) : "0";
                        return [
                          `${val} معاملة (${pct}%) — ${formatSAR(method?.revenue ?? 0)} ر.س`,
                          method?.label ?? "",
                        ];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Method rows */}
                <div className="space-y-2">
                  {report.paymentMethods.map((m) => {
                    const pct = totalMethodCount > 0 ? (m.count / totalMethodCount) * 100 : 0;
                    return (
                      <div key={m.method} className="flex items-center gap-3">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: METHOD_COLORS[m.method] ?? "#9CA3AF" }}
                        />
                        <span className="text-xs font-medium text-[#0B2A4A] w-20 flex-shrink-0">{m.label}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: METHOD_COLORS[m.method] ?? "#9CA3AF",
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 w-10 text-left flex-shrink-0">
                          {pct.toFixed(0)}%
                        </span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {m.count} | {formatSAR(m.revenue)} ر.س
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Monthly Revenue Bar ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-heading font-semibold text-sm text-[#0B2A4A] mb-4 flex items-center gap-2">
              <CalendarDays size={15} strokeWidth={1.75} className="text-[#0B2A4A]" />
              المبيعات الشهرية (آخر ٦ أشهر)
            </h2>
            {(!report.monthlyRevenue || report.monthlyRevenue.length === 0) ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                لا توجد بيانات شهرية بعد
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={report.monthlyRevenue}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                  barSize={28}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 9, fill: "#9CA3AF" }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tickFormatter={(v) => v.replace(/\s\d{4}$/, "")}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#9CA3AF" }}
                    tickLine={false}
                    axisLine={false}
                    width={38}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px", direction: "rtl" }}
                    formatter={(val: number) => [`${formatSAR(val)} ر.س`, "الإيراد"]}
                    labelFormatter={(label) => label}
                  />
                  <Bar dataKey="revenue" radius={[5, 5, 0, 0]}>
                    {report.monthlyRevenue.map((entry, i) => {
                      const isCurrentMonth =
                        entry.month ===
                        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
                      return (
                        <Cell
                          key={i}
                          fill={isCurrentMonth ? "#2BB6A3" : entry.revenue > 0 ? "#0B2A4A" : "#E5E7EB"}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {/* Month labels row */}
            {report.monthlyRevenue.length > 0 && (
              <div className="flex justify-end mt-2 gap-4 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#2BB6A3] inline-block" />
                  الشهر الحالي
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#0B2A4A] inline-block" />
                  أشهر سابقة
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Templates + Daily Transactions */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Templates */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-heading font-semibold text-sm text-[#0B2A4A] mb-4 flex items-center gap-2">
              <Trophy size={15} strokeWidth={1.75} className="text-amber-500" />
              النماذج الأكثر مبيعاً
            </h2>
            {report.topTemplates.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                لا توجد مبيعات بعد في هذه الفترة
              </div>
            ) : (
              <div className="space-y-3">
                {report.topTemplates.map((tpl, idx) => (
                  <div key={tpl.templateId} className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        idx === 0 ? "bg-amber-100 text-amber-600"
                        : idx === 1 ? "bg-gray-100 text-gray-500"
                        : idx === 2 ? "bg-orange-100 text-orange-500"
                        : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#0B2A4A] truncate leading-snug">
                        {tpl.templateTitle}
                      </p>
                      <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2BB6A3] rounded-full transition-all"
                          style={{ width: `${(tpl.units / maxUnits) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-left flex-shrink-0">
                      <p className="text-xs font-bold text-[#0B2A4A]">{tpl.units} نسخة</p>
                      <p className="text-[10px] text-gray-400">{formatSAR(tpl.revenue)} ر.س</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Transactions Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-heading font-semibold text-sm text-[#0B2A4A] mb-4 flex items-center gap-2">
              <CreditCard size={15} strokeWidth={1.75} className="text-[#0B2A4A]" />
              عدد المعاملات اليومية
            </h2>
            {report.dailyRevenue.every((d) => d.transactions === 0) ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                لا توجد معاملات في هذه الفترة
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={report.dailyRevenue}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                  barSize={period <= 7 ? 20 : period <= 30 ? 8 : 5}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatDate}
                    tick={{ fontSize: 9, fill: "#9CA3AF" }} tickLine={false} axisLine={false}
                    interval={period <= 7 ? 0 : period <= 30 ? 4 : 9} />
                  <YAxis allowDecimals={false}
                    tick={{ fontSize: 9, fill: "#9CA3AF" }} tickLine={false} axisLine={false} width={25} />
                  <Tooltip
                    contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px", direction: "rtl" }}
                    formatter={(val: number) => [val, "معاملة"]}
                    labelFormatter={formatDate}
                  />
                  <Bar dataKey="transactions" radius={[4, 4, 0, 0]}>
                    {report.dailyRevenue.map((entry, i) => (
                      <Cell key={i} fill={entry.transactions > 0 ? "#0B2A4A" : "#E5E7EB"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* ── Recent Transactions Table ── */}
      {report && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 space-y-3">
            {/* Title row */}
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-semibold text-sm text-[#0B2A4A] flex items-center gap-2">
                <ClipboardList size={15} strokeWidth={1.75} className="text-[#2BB6A3]" />
                آخر المعاملات
              </h2>
              {/* Results counter */}
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${
                  filtersActive
                    ? "bg-teal-50 text-teal-600 border-teal-200"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                {filteredTransactions.length} / {report.recentTransactions?.length ?? 0} معاملة
              </span>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-[160px]">
                <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" strokeWidth={1.75} />
                <input
                  type="text"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو رقم المعاملة..."
                  className="w-full border border-gray-200 rounded-lg pr-8 pl-8 py-1.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-teal-400 transition-all"
                />
                {txSearch && (
                  <button
                    onClick={() => setTxSearch("")}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              {/* Status filter */}
              <select
                value={txStatus}
                onChange={(e) => setTxStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-teal-400 transition-all text-gray-600 cursor-pointer"
              >
                <option value="all">كل الحالات</option>
                <option value="paid">مدفوع</option>
                <option value="failed">فشل</option>
                <option value="refunded">مُسترجع</option>
                <option value="authorized">مُعتمد</option>
                <option value="initiated">بانتظار</option>
                <option value="voided">ملغي</option>
              </select>

              {/* Payment method filter */}
              <select
                value={txMethod}
                onChange={(e) => setTxMethod(e.target.value)}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-teal-400 transition-all text-gray-600 cursor-pointer"
              >
                <option value="all">كل طرق الدفع</option>
                <option value="mada">مدى</option>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="applepay">Apple Pay</option>
                <option value="stcpay">STC Pay</option>
              </select>

              {/* Reset filters */}
              {filtersActive && (
                <button
                  onClick={() => { setTxSearch(""); setTxStatus("all"); setTxMethod("all"); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors"
                >
                  <X size={11} strokeWidth={2.5} />
                  إعادة تعيين
                </button>
              )}
            </div>
          </div>

          {!report.recentTransactions || report.recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              لا توجد معاملات بعد
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" dir="rtl">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 whitespace-nowrap">رقم المعاملة</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 whitespace-nowrap">حامل البطاقة</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 whitespace-nowrap">طريقة الدفع</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 whitespace-nowrap">المبلغ</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 whitespace-nowrap">التاريخ</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 whitespace-nowrap">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400 text-sm">
                        لا توجد نتائج مطابقة للفلتر المحدد
                      </td>
                    </tr>
                  )}
                  {filteredTransactions.map((tx) => {
                    const cardInfo = getCardInfo(tx.cardCompany, tx.sourceType);
                    const statusBadge = getStatusBadge(tx.status);
                    const isCopied = copiedId === tx.id;
                    const shortId = tx.id ? `${tx.id.slice(0, 8)}…` : "—";

                    return (
                      <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Transaction ID + copy */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-[#0B2A4A] font-medium">{shortId}</span>
                            <button
                              onClick={() => copy(tx.id, tx.id)}
                              title="نسخ رقم المعاملة"
                              className={`p-1 rounded-md transition-all ${
                                isCopied
                                  ? "bg-emerald-50 text-emerald-500"
                                  : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                              }`}
                            >
                              {isCopied
                                ? <Check size={11} strokeWidth={2.5} />
                                : <Copy size={11} strokeWidth={1.75} />}
                            </button>
                          </div>
                        </td>

                        {/* Cardholder */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-700 font-medium">
                            {tx.cardName || <span className="text-gray-300">—</span>}
                          </span>
                        </td>

                        {/* Payment method */}
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold"
                            style={{ color: cardInfo.color, backgroundColor: cardInfo.bg }}
                          >
                            {cardInfo.label}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-[#0B2A4A]">
                            {formatSAR(tx.amount)}
                            <span className="font-normal text-gray-400 text-[10px] mr-0.5"> ر.س</span>
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-gray-500 whitespace-nowrap">
                            {tx.createdAt
                              ? new Date(tx.createdAt).toLocaleString("ar-SA", {
                                  month: "short", day: "numeric",
                                  hour: "2-digit", minute: "2-digit", hour12: true,
                                })
                              : "—"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge.cls}`}>
                            {statusBadge.label}
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
      )}

      {/* No data */}
      {!loading && !error && report && report.kpi.totalTransactions === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-700 flex items-start gap-3">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">لا توجد مبيعات مكتملة في هذه الفترة</p>
            <p className="text-amber-500 text-xs mt-0.5">
              تأكد من إتمام دفعات تجريبية عبر Moyasar لرؤية البيانات هنا.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
