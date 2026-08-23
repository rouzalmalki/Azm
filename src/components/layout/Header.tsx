import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { Menu, X, BookOpen, User, Home, Landmark, ChevronDown, Eye, Target, Flag, Briefcase, Phone, ShoppingCart, ScrollText } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { useCart } from "@/hooks/useCart";
import CartDrawer from "@/components/features/CartDrawer";

const NAV_ITEMS = [
{ to: "/", label: "الرئيسية", icon: Home },
{ to: "/library", label: "المكتبة", icon: BookOpen },
{ to: "/jobs", label: "التوظيف", icon: Briefcase },
{ to: "/contact", label: "اتصل بنا", icon: Phone },
{ to: "/account", label: "حسابي", icon: User }];


const ABOUT_SUB_ITEMS = [
{ to: "/about#vision", label: "الرؤية", icon: Eye },
{ to: "/about#mission", label: "الرسالة", icon: Target }];


export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { count: cartCount } = useCart();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAboutOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for cart open event dispatched from toast action
  useEffect(() => {
    const handler = () => setCartOpen(true);
    window.addEventListener("azm:open-cart", handler);
    return () => window.removeEventListener("azm:open-cart", handler);
  }, []);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 focus:outline-none">
            
            <div className="h-10 w-10 flex-shrink-0">
              <img
                src={logo}
                alt="شعار عزم"
                className="h-full w-full object-contain" />
              
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="font-heading font-bold text-lg text-[#0B2A4A] leading-tight">
                عزم
              </span>
              <span className="text-[10px] text-[#2BB6A3] font-medium tracking-wide" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                حوكمة الوثائق والنماذج
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {/* الرئيسية */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
              isActive ?
              "bg-teal-50 text-teal text-[#2BB6A3]" :
              "text-text-secondary hover:text-primary-500 hover:bg-gray-50"}`

              }>
              
              <Home size={16} strokeWidth={1.75} />
              الرئيسية
            </NavLink>

            {/* About Dropdown — بجانب الرئيسية */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAboutOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                aboutOpen ?
                "bg-teal-50 text-[#2BB6A3]" :
                "text-text-secondary hover:text-primary-500 hover:bg-gray-50"}`
                }>
                
                <Landmark size={16} strokeWidth={1.75} />
                عن منصة عزم
              </button>

              {aboutOpen &&
              <div className="absolute top-full mt-1 right-0 w-44 bg-white border border-border rounded-xl shadow-lg py-1 z-50">
                  {ABOUT_SUB_ITEMS.map((sub) =>
                <Link
                  key={sub.to}
                  to={sub.to}
                  onClick={() => setAboutOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:bg-teal-50 hover:text-[#2BB6A3] transition-colors">
                  
                      <sub.icon size={15} strokeWidth={1.75} />
                      {sub.label}
                    </Link>
                )}
                  <div className="border-t border-border mt-1 pt-1">
                    <Link
                    to="/about#goals"
                    onClick={() => setAboutOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:bg-teal-50 hover:text-[#2BB6A3] transition-colors">
                    
                      <Flag size={15} strokeWidth={1.75} />
                      الأهداف
                    </Link>
                    






                  
                  </div>
                </div>
              }
            </div>

            {/* بقية عناصر التنقل */}
            {NAV_ITEMS.filter((item) => item.to !== "/").map((item) =>
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
              isActive ?
              "bg-teal-50 text-teal text-[#2BB6A3]" :
              "text-text-secondary hover:text-primary-500 hover:bg-gray-50"}`

              }>
              
                <item.icon size={16} strokeWidth={1.75} />
                {item.label}
              </NavLink>
            )}
          </nav>

          {/* Cart Button */}
          <button
            onClick={() => setCartOpen(true)}
            aria-label="سلة التسوق"
            className="relative p-2 rounded-md text-text-secondary hover:text-primary-500 hover:bg-gray-50 transition-colors">
            
            <ShoppingCart size={20} strokeWidth={1.75} />
            {cartCount > 0 &&
            <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] rounded-full bg-[#2BB6A3] text-white text-[10px] font-bold flex items-center justify-center px-0.5 shadow-sm">
                {cartCount}
              </span>
            }
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-md text-text-secondary hover:text-primary-500 hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="القائمة">
            
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen &&
      <div className="md:hidden bg-white border-t border-border px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) =>
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) =>
          `flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
          isActive ?
          "bg-teal-50 text-[#2BB6A3]" :
          "text-text-secondary hover:bg-gray-50 hover:text-primary-500"}`

          }>
          
              <item.icon size={17} strokeWidth={1.75} />
              {item.label}
            </NavLink>
        )}

          {/* Mobile About Accordion */}
          <div>
            <button
            onClick={() => setMobileAboutOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-text-secondary hover:bg-gray-50 hover:text-primary-500 transition-colors">
            
              <div className="flex items-center gap-2">
                <Landmark size={17} strokeWidth={1.75} />
                عن منصة عزم
              </div>
              <ChevronDown
              size={14}
              strokeWidth={2}
              className={`transition-transform duration-200 ${mobileAboutOpen ? "rotate-180" : ""}`} />
            
            </button>
            {mobileAboutOpen &&
          <div className="mr-6 mt-1 space-y-1 border-r-2 border-teal-100 pr-3">
                {ABOUT_SUB_ITEMS.map((sub) =>
            <Link
              key={sub.to}
              to={sub.to}
              onClick={() => {setMenuOpen(false);setMobileAboutOpen(false);}}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-text-secondary hover:bg-teal-50 hover:text-[#2BB6A3] transition-colors">
              
                    <sub.icon size={15} strokeWidth={1.75} />
                    {sub.label}
                  </Link>
            )}
                <Link
              to="/about#goals"
              onClick={() => {setMenuOpen(false);setMobileAboutOpen(false);}}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-text-secondary hover:bg-teal-50 hover:text-[#2BB6A3] transition-colors">
              
                  <Flag size={15} strokeWidth={1.75} />
                  الأهداف
                </Link>
                <Link
              to="/terms"
              onClick={() => {setMenuOpen(false);setMobileAboutOpen(false);}}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-text-secondary hover:bg-teal-50 hover:text-[#2BB6A3] transition-colors">
              
                  <ScrollText size={15} strokeWidth={1.75} />
                  شروط الاستخدام
                </Link>
              </div>
          }
          </div>
        </div>
      }
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>);

}