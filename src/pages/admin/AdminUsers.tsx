import { Users, Mail, Calendar, Shield, Search, Filter } from "lucide-react";

const MOCK_USERS = [
  { id: "u1", name: "محمد العمري", email: "m.omari@example.com", joined: "2026-01-10", downloads: 14, role: "مستخدم" },
  { id: "u2", name: "سارة الزهراني", email: "s.zahrani@example.com", joined: "2026-02-18", downloads: 8, role: "مستخدم" },
  { id: "u3", name: "أحمد القحطاني", email: "a.qahtani@example.com", joined: "2026-03-05", downloads: 22, role: "مستخدم" },
  { id: "u4", name: "نورة الشمري", email: "n.shamri@example.com", joined: "2026-03-20", downloads: 5, role: "مستخدم" },
  { id: "u5", name: "عبدالله الدوسري", email: "a.dosari@example.com", joined: "2026-04-12", downloads: 31, role: "مدير" },
  { id: "u6", name: "منيرة العتيبي", email: "m.otaibi@example.com", joined: "2026-05-01", downloads: 18, role: "مستخدم" },
  { id: "u7", name: "خالد الغامدي", email: "k.ghamdi@example.com", joined: "2026-06-07", downloads: 7, role: "مستخدم" },
  { id: "u8", name: "ريم السبيعي", email: "r.subaie@example.com", joined: "2026-07-15", downloads: 3, role: "مستخدم" },
];

export default function AdminUsers() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-heading font-bold text-2xl text-[#0B2A4A]">المستخدمون</h2>
        <p className="text-gray-500 text-sm mt-0.5">{MOCK_USERS.length} مستخدم مسجل</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "إجمالي المستخدمين", value: MOCK_USERS.length, icon: Users, color: "bg-blue-50 text-blue-600" },
          { label: "المسجلون هذا الشهر", value: 3, icon: Calendar, color: "bg-teal-50 text-teal-600" },
          { label: "المدراء", value: MOCK_USERS.filter((u) => u.role === "مدير").length, icon: Shield, color: "bg-indigo-50 text-indigo-600" },
          { label: "إجمالي التنزيلات", value: MOCK_USERS.reduce((a, u) => a + u.downloads, 0), icon: Mail, color: "bg-amber-50 text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon size={18} strokeWidth={1.75} />
            </div>
            <p className="font-heading font-bold text-xl text-[#0B2A4A]">{s.value}</p>
            <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <h3 className="font-heading font-semibold text-[#0B2A4A] text-sm">قائمة المستخدمين</h3>
          <div className="relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="بحث..."
              className="bg-gray-50 border border-gray-200 rounded-lg pr-8 pl-3 py-1.5 text-xs focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs">المستخدم</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs hidden sm:table-cell">البريد الإلكتروني</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs hidden md:table-cell">تاريخ التسجيل</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs">التنزيلات</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs">الدور</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_USERS.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0B2A4A]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#0B2A4A] text-xs font-bold">{user.name[0]}</span>
                      </div>
                      <span className="font-medium text-gray-800 text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-gray-500 text-xs">{user.email}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center hidden md:table-cell">
                    <span className="text-gray-400 text-xs">{user.joined}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-gray-700 text-sm font-medium">{user.downloads}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      user.role === "مدير"
                        ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
