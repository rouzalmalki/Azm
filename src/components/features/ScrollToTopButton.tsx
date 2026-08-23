/**
 * ScrollToTopButton — appears after scrolling 300px with fade-in animation.
 * Fixed circle in the bottom-left corner (RTL-friendly end position).
 */
import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      onClick={scrollToTop}
      aria-label="عودة للأعلى"
      title="عودة للأعلى"
      className={`fixed bottom-6 left-6 z-50 w-11 h-11 rounded-full bg-[#0B2A4A] text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-[#2BB6A3] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-300 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <ChevronUp size={20} strokeWidth={2.5} />
    </button>
  );
}
