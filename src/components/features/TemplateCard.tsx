import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Bookmark, BookmarkCheck, Clock, FileType2, ShoppingCart, Loader2, Plus, Check } from "lucide-react";
import type { Template } from "@/types";
import { supabase } from "@/lib/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useCart } from "@/hooks/useCart";
import { usePurchased } from "@/hooks/usePurchased";

interface TemplateCardProps {
  template: Template;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onDownload: (id: string, format: "word" | "pdf") => void;
}

export default function TemplateCard({
  template,
  isSaved,
  onToggleSave,
  onDownload,
}: TemplateCardProps) {
  const navigate = useNavigate();
  const [buyLoading, setBuyLoading] = useState(false);
  const { addItem, isInCart } = useCart();
  const { isPurchased } = usePurchased();
  const inCart = isInCart(template.id);
  const purchased = isPurchased(template.id);

  const categoryLabel = template.category.replace(/_/g, " ");
  const typeLabel = template.documentType.replace(/_/g, " ");

  const handleBuy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setBuyLoading(true);
    const { data, error } = await supabase.functions.invoke("create-payment", {
      body: { templateId: template.id, templateTitle: template.title },
    });

    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) {
        try {
          const txt = await error.context?.text();
          msg = txt || msg;
        } catch { /* ignore */ }
      }
      console.error("[buy]", msg);
      alert("حدث خطأ أثناء بدء الدفع. يرجى المحاولة لاحقاً.");
      setBuyLoading(false);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    } else {
      setBuyLoading(false);
    }
  };

  return (
    <div className="card-hover flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => navigate(`/template/${template.id}`)}
          className="flex-1 text-right">
          
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="badge badge-navy text-xs">{categoryLabel}</span>
            {template.isNew &&
            <span className="badge bg-teal-50 text-[#2BB6A3] text-xs">جديد</span>
            }
            {purchased && (
              <span className="badge bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs flex items-center gap-1">
                <Check size={10} strokeWidth={3} />
                مشترى
              </span>
            )}
          </div>
          <h3 className="font-heading font-semibold text-base text-primary-500 leading-snug mb-1 hover:text-teal transition-colors">
            {template.title}
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
            {template.description}
          </p>
        </button>

        <button
          onClick={() => onToggleSave(template.id)}
          className="p-2 rounded-md text-text-muted hover:text-teal hover:bg-teal-50 transition-colors flex-shrink-0"
          aria-label={isSaved ? "إزالة من المحفوظات" : "حفظ النموذج"}>
          {isSaved ?
          <BookmarkCheck size={18} className="text-[#2BB6A3]" /> :
          <Bookmark size={18} />
          }
        </button>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <FileType2 size={13} strokeWidth={1.75} />
          {typeLabel}
        </span>
        <span className="flex items-center gap-1">
          <Download size={13} strokeWidth={1.75} />
          {template.downloads.toLocaleString("ar-SA")} تنزيل
        </span>
        <span className="flex items-center gap-1">
          <Clock size={13} strokeWidth={1.75} />
          {new Date(template.lastUpdated).toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "short"
          })}
        </span>
        <span className="mr-auto font-bold text-sm text-[#0B2A4A]">
          ١٠ ر.س
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 border-t border-border pt-3">
        {purchased ? (
          /* ── Purchased: show free download buttons ── */
          <>
            <div className="flex items-center gap-1.5 mb-1">
              <Check size={13} strokeWidth={2.5} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600">تم الشراء — جاهز للتنزيل</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onDownload(template.id, "word")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-white bg-[#0B2A4A] hover:bg-[#0d3260] transition-colors">
                <Download size={12} strokeWidth={2} />
                Word
              </button>
              <button
                onClick={() => onDownload(template.id, "pdf")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-white bg-[#2BB6A3] hover:bg-teal-600 transition-colors">
                <Download size={12} strokeWidth={2} />
                PDF
              </button>
            </div>
          </>
        ) : (
          /* ── Not purchased: cart + buy ── */
          <>
            <div className="flex gap-2">
              {/* Add to cart */}
              <button
                onClick={(e) => { e.stopPropagation(); addItem(template); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                  inCart
                    ? "border-[#2BB6A3] bg-teal-50 text-[#2BB6A3] cursor-default"
                    : "border-[#0B2A4A] text-[#0B2A4A] hover:bg-[#0B2A4A] hover:text-white"
                }`}
                disabled={inCart}
              >
                {inCart ? <Check size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
                {inCart ? "في السلة" : "أضف للسلة"}
              </button>

              {/* Direct buy */}
              <button
                onClick={handleBuy}
                disabled={buyLoading}
                title="شراء فوري"
                className="px-3 py-2.5 rounded-lg bg-[#0B2A4A] hover:bg-[#0d3260] text-white text-sm font-semibold transition-colors disabled:opacity-60 flex-shrink-0"
              >
                {buyLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <ShoppingCart size={15} strokeWidth={1.75} />
                )}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onDownload(template.id, "word")}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium text-primary-500 border border-border hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <Download size={12} strokeWidth={1.75} />
                Word فقط
              </button>
              <button
                onClick={() => onDownload(template.id, "pdf")}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium text-primary-400 border border-border hover:border-teal-300 hover:bg-teal-50 transition-colors">
                <Download size={12} strokeWidth={1.75} />
                PDF فقط
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
