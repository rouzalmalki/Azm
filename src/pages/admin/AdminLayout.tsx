
import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Grid3X3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ArrowUpRight,
  BarChart3,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { adminTokenStore } from "@/lib/adminToken";
import logo from "@/assets/logo.jpg";

const SIDE_NAV = [ // Added 'const SIDE_NAV =' to define the array
  { to: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, end: true },
  { to: "/admin/templates", label: "إدارة النماذج", icon: FileText, end: false },
  { to: "/admin/categories", label: "إدارة التصنيفات", icon: Grid3X3, end: false },
  { to: "/admin/users", label: "المستخدمون", icon: Users, end: false },
  { to: "/admin/conversion", label: "تقرير التحويل", icon: ArrowUpRight, end: false },
  { to: "/admin/performance", label: "تقرير الأداء", icon: BarChart3, end: false },
  { to: "/admin/sales", label: "تقرير المبيعات", icon: TrendingUp, end: false },
  { to: "/admin/messages", label: "رسائل التواصل", icon: MessageSquare, end: false },
  { to: "/admin/settings", label: "الإعدادات", icon: Settings, end: false },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [, setAdminAuth] = useLocalStorage<boolean>("azm_admin_auth", false);

  const handleLogout = () => {
    setAdminAuth(false);
    adminTokenStore.clear(); // مسح التوكن من الذاكرة عند تسجيل الخروج
    navigate("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="h-9 w-9 flex-shrink-0 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
          <img src={logo} alt="عزم" className="h-full w-full object-contain" />
        </div>
        {sidebarOpen && (
          <div className="flex flex-col leading-none">
            <span className="font-heading font-bold text-white text-base">عزم</span>
            <span className="text-[10px] text-teal-300 mt-0.5">لوحة الإدارة</span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {SIDE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  strokeWidth={isActive ? 2 : 1.75}
                  className={isActive ? "text-teal-300" : "text-white/50 group-hover:text-white/80"}
                />
                {sidebarOpen && <span>{item.label}</span>}
                {isActive && sidebarOpen && (
                  <ChevronLeft size={14} className="mr-auto text-teal-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-2 py-4 border-t border-white/10 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut size={18} strokeWidth={1.75} className="text-white/50" />
          {sidebarOpen && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#0B2A4A] transition-all duration-300 flex-shrink-0 ${
          sidebarOpen ? "w-56" : "w-16"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="fixed right-0 top-0 h-full w-64 bg-[#0B2A4A] z-50 md:hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg overflow-hidden bg-white/10">
                  <img src={logo} alt="عزم" className="h-full w-full object-contain" />
                </div>
                <span className="font-heading font-bold text-white">عزم — الإدارة</span>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {SIDE_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <item.icon size={18} strokeWidth={1.75} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="px-2 py-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all"
              >
                <LogOut size={18} />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 flex items-center gap-3 sticky top-0 z-30">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          {/* Desktop sidebar toggle */}
          <button
            className="hidden md:flex p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <Menu size={20} />
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <h1 className="font-heading font-semibold text-[#0B2A4A] text-sm">
            لوحة تحكم منصة عزم
          </h1>
          <div className="mr-auto flex items-center gap-2">
            <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-medium text-teal-700">نشط</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0B2A4A] flex items-center justify-center">
              <span className="text-white text-xs font-bold">م</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
