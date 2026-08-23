import { Link } from "react-router-dom";
import { Phone, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary-500 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-teal rounded-sm flex items-center justify-center">
                <span className="text-white font-heading font-bold text-lg leading-none">ع</span>
              </div>
              <span className="font-heading font-bold text-xl">عزم</span>
            </div>
            <p className="text-primary-200 text-sm leading-relaxed">
              منصة متخصصة في توفير النماذج والخطابات الرسمية المعتمدة لمنظمات
              المجتمع المدني والجمعيات الأهلية.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading font-semibold text-sm mb-4 text-primary-100">
              أقسام المنصة
            </h3>
            <ul className="space-y-2 text-sm text-primary-200">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/library" className="hover:text-white transition-colors">
                  مكتبة النماذج
                </Link>
              </li>
              <li>
                

                
              </li>
              <li>
                <Link to="/account" className="hover:text-white transition-colors">
                  حسابي
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-heading font-semibold text-sm mb-4 text-primary-100">تواصل معنا</h3>
            <ul className="space-y-2 text-sm text-primary-200">
              <li>
                <a href="https://wa.me/966508819116" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal" />
                  <span>0508819116</span>
                </a>
              </li>
              <li>
                <Link to="/library?category=المراسلات_الرسمية" className="hover:text-white transition-colors flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal" />
                  <span>من الساعة 4 م إلى 10 م</span>
                </Link>
              </li>
              <li>
                

                
              </li>
              <li>
                

                
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-heading font-semibold text-sm mb-4 text-primary-100">
              تابعنا على منصات التواصل الاجتماعي
            </h3>
            <div className="flex flex-wrap gap-3">
              {/* WhatsApp */}
              <a
                href="https://wa.me/966508819116"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="واتساب"
                className="w-10 h-10 rounded-md bg-primary-400 hover:bg-[#25D366] flex items-center justify-center transition-colors duration-200 group">
                
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="#"
                aria-label="تيك توك"
                className="w-10 h-10 rounded-md bg-primary-400 hover:bg-[#010101] flex items-center justify-center transition-colors duration-200">
                
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
                </svg>
              </a>

              {/* X (Twitter) */}
              <a
                href="#"
                aria-label="منصة إكس"
                className="w-10 h-10 rounded-md bg-primary-400 hover:bg-[#000000] flex items-center justify-center transition-colors duration-200">
                
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>


            </div>
          </div>
        </div>

        <div className="border-t border-primary-400 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-primary-200 text-xs">
            © 2026 منصة عزم — جميع الحقوق محفوظة
          </p>
          <p className="text-primary-300 text-xs">
            النماذج للاسترشاد؛ استشر مختصاً قانونياً عند الحاجة
          </p>
        </div>
      </div>
    </footer>);

}