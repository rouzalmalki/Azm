import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Download, Bookmark, BookmarkCheck, Clock, ArrowRight, Tag, FileType2, Star, RefreshCw, ShoppingCart, Loader2, Plus, Check, ChevronLeft, ThumbsUp, MessageSquare, Send, Trash2, UserCircle2 } from "lucide-react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTemplates } from "@/hooks/useTemplates";
import { useCart } from "@/hooks/useCart";
import { usePurchased } from "@/hooks/usePurchased";
import { useRatings } from "@/hooks/useRatings";
import { useComments } from "@/hooks/useComments";
import type { SavedTemplate, DownloadRecord } from "@/types";
import TemplateCard from "@/components/features/TemplateCard";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";
import { recordTemplateView, markViewDownloaded, updateTimeSpent } from "@/lib/tracking";
import { supabase } from "@/lib/supabase";

export default function TemplatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { templates: ALL_TEMPLATES, loading: templatesLoading } = useTemplates();
  const template = ALL_TEMPLATES.find((t) => t.id === id);
  const related = template
    ? ALL_TEMPLATES.filter((t) => template.relatedIds.includes(t.id))
    : [];

  const [savedTemplates, setSavedTemplates] = useLocalStorage<SavedTemplate[]>("azm_saved", []);
  const [downloads, setDownloads] = useLocalStorage<DownloadRecord[]>("azm_downloads", []);
  const [buyLoading, setBuyLoading] = useState(false);
  const { addItem, isInCart } = useCart();
  const { isPurchased } = usePurchased();
  const { getTemplateRating, rateTemplate } = useRatings();
  const { getComments, addComment, deleteComment } = useComments();
  const inCart = template ? isInCart(template.id) : false;
  const purchased = template ? isPurchased(template.id) : false;

  // ─── Rating State ────────────────────────────────────────────────────────
  const [hoverStar, setHoverStar] = useState(0);
  const [justRated, setJustRated] = useState(false);

  // ─── Comments State ──────────────────────────────────────────────────────
  const [commentText, setCommentText] = useState("");
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const MAX_COMMENT_LENGTH = 300;

  const ratingInfo = template
    ? getTemplateRating(template.id, template.rating)
    : { average: 0, count: 0, userRating: 0 };

  const handleRate = (star: number) => {
    if (!template) return;
    rateTemplate(template.id, star, template.rating);
    setJustRated(true);
    setTimeout(() => setJustRated(false), 2500);
  };

  const handleSubmitComment = () => {
    if (!template || !commentText.trim()) return;
    addComment(template.id, commentText);
    setCommentText("");
    setCommentSubmitted(true);
    setTimeout(() => setCommentSubmitted(false), 2500);
  };

  const formatCommentDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
  };

  const handleBuy = async () => {
    if (!template) return;
    setBuyLoading(true);
    const { data, error } = await supabase.functions.invoke("create-payment", {
      body: { templateId: template.id, templateTitle: template.title },
    });
    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) {
        try { msg = await error.context?.text() || msg; } catch { /* ignore */ }
      }
      console.error("[buy]", msg);
      alert("حدث خطأ أثناء بدء الدفع. يرجى المحاولة لاحقاً.");
      setBuyLoading(false);
      return;
    }
    if (data?.url) window.location.href = data.url;
    else setBuyLoading(false);
  };

  // ─── View Tracking ───────────────────────────────────────────────────────
  const viewIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!template) return;

    recordTemplateView(template.id, template.title).then((vid) => {
      viewIdRef.current = vid;
      console.log("[tracking] view recorded:", vid);
    });

    startTimeRef.current = Date.now();

    return () => {
      const seconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (viewIdRef.current) {
        updateTimeSpent(viewIdRef.current, seconds);
      }
    };
  }, [template?.id]);

  // ─── ─────────────────────────────────────────────────────────────────────

  const isSaved = savedTemplates.some((s) => s.templateId === id);

  const handleToggleSave = () => {
    if (!id) return;
    if (isSaved) {
      setSavedTemplates(savedTemplates.filter((s) => s.templateId !== id));
    } else {
      setSavedTemplates([...savedTemplates, { templateId: id, savedAt: new Date().toISOString() }]);
    }
  };

  const handleDownload = (tid: string, format: "word" | "pdf") => {
    const tpl = ALL_TEMPLATES.find((t) => t.id === tid);
    if (!tpl) return;

    const url = format === "word" ? tpl.wordUrl : tpl.pdfUrl;
    if (url) window.open(url, "_blank", "noopener,noreferrer");

    setDownloads([
      { templateId: tid, templateTitle: tpl.title, date: new Date().toISOString(), format },
      ...downloads,
    ]);
    if (tid === template?.id && viewIdRef.current) {
      markViewDownloaded(viewIdRef.current, format);
    }
    console.log(`Download: ${tpl.title} [${format}]${url ? " → " + url : " (no file)"}`);
  };

  if (templatesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <RefreshCw size={28} className="text-gray-300 animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">جارٍ تحميل النموذج...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-text-muted text-lg mb-4">النموذج غير موجود</p>
        <button onClick={() => navigate("/library")} className="btn-primary">
          العودة للمكتبة
        </button>
      </div>
    );
  }

  const isSavedRelated = (tid: string) => savedTemplates.some((s) => s.templateId === tid);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link to="/" className="hover:text-primary-500">الرئيسية</Link>
        <ArrowRight size={14} className="rtl-flip" />
        <Link to="/library" className="hover:text-primary-500">المكتبة</Link>
        <ArrowRight size={14} className="rtl-flip" />
        <span className="text-text-primary truncate">{template.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="card">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge-navy text-xs">
                {template.category.replace(/_/g, " ")}
              </span>
              <span className="badge-gray text-xs">
                {template.documentType.replace(/_/g, " ")}
              </span>
              {template.isNew && (
                <span className="badge bg-teal-50 text-[#2BB6A3] text-xs">جديد</span>
              )}
            </div>

            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="font-heading font-bold text-2xl text-primary-500 leading-tight">
                {template.title}
              </h1>
              <button
                onClick={handleToggleSave}
                className="flex-shrink-0 p-2 rounded-md border border-border hover:border-teal-300 hover:bg-teal-50 transition-colors"
                aria-label="حفظ"
              >
                {isSaved ? (
                  <BookmarkCheck size={20} className="text-[#2BB6A3]" />
                ) : (
                  <Bookmark size={20} className="text-text-muted" />
                )}
              </button>
            </div>

            <p className="text-text-secondary text-base leading-relaxed mb-4">
              {template.description}
            </p>

            {/* Meta Row */}
            <div className="flex flex-wrap gap-4 text-sm text-text-muted border-t border-border pt-4">
              <span className="flex items-center gap-1.5">
                <Clock size={14} strokeWidth={1.75} />
                آخر تحديث:{" "}
                {new Date(template.lastUpdated).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Download size={14} strokeWidth={1.75} />
                {template.downloads.toLocaleString("ar-SA")} تنزيل
              </span>
              <span className="flex items-center gap-1.5">
                <Star size={14} strokeWidth={1.75} className="fill-amber-400 text-amber-400" />
                {template.rating}
              </span>
              <span className="flex items-center gap-1.5">
                <FileType2 size={14} strokeWidth={1.75} />
                الإصدار {template.version} — {template.pageCount} صفحة
              </span>
            </div>
          </div>

          {/* Rating Card */}
          <div className="card">
            <h2 className="font-heading font-semibold text-base text-primary-500 mb-4 flex items-center gap-2">
              <Star size={16} strokeWidth={1.75} className="text-amber-400 fill-amber-400" />
              تقييم النموذج
            </h2>

            {/* Community Average */}
            <div className="flex items-center gap-4 mb-5 p-3 bg-gray-50 rounded-xl border border-border">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#0B2A4A] leading-none">{ratingInfo.average.toFixed(1)}</p>
                <p className="text-[11px] text-text-muted mt-1">من 5</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-0.5 mb-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      strokeWidth={1.5}
                      className={`${
                        s <= Math.round(ratingInfo.average)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200 fill-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-text-muted">
                  {ratingInfo.count.toLocaleString("ar-SA")} تقييم من المستخدمين
                </p>
              </div>
            </div>

            {/* User Rating Input */}
            <div>
              <p className="text-sm font-medium text-text-secondary mb-3">
                {ratingInfo.userRating > 0 ? "تقييمك الحالي:" : "قيِّم هذا النموذج:"}
              </p>
              <div
                className="flex items-center gap-1.5"
                onMouseLeave={() => setHoverStar(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverStar || ratingInfo.userRating) >= star;
                  return (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      onMouseEnter={() => setHoverStar(star)}
                      aria-label={`${star} نجوم`}
                      className="p-1 rounded-md transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-300"
                    >
                      <Star
                        size={28}
                        strokeWidth={1.5}
                        className={`transition-colors ${
                          active
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300 fill-gray-100"
                        }`}
                      />
                    </button>
                  );
                })}
                {ratingInfo.userRating > 0 && (
                  <span className="mr-2 text-sm font-semibold text-amber-600">
                    {["", "ضعيف", "مقبول", "جيد", "جيد جداً", "ممتاز"][ratingInfo.userRating]}
                  </span>
                )}
              </div>

              {justRated && (
                <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                  <ThumbsUp size={14} className="text-emerald-500 flex-shrink-0" strokeWidth={2} />
                  <p className="text-xs font-medium text-emerald-700">شكراً على تقييمك! ساهمت في تحسين تجربة المجتمع.</p>
                </div>
              )}
              {ratingInfo.userRating > 0 && !justRated && (
                <p className="mt-2 text-[11px] text-text-muted">
                  يمكنك تحديث تقييمك في أي وقت بالنقر على نجمة أخرى.
                </p>
              )}
            </div>
          </div>

          {/* Comments Section */}
          {template && (() => {
            const comments = getComments(template.id);
            return (
              <div className="card">
                <h2 className="font-heading font-semibold text-base text-primary-500 mb-4 flex items-center gap-2">
                  <MessageSquare size={16} strokeWidth={1.75} className="text-[#2BB6A3]" />
                  الملاحظات والتعليقات
                  {comments.length > 0 && (
                    <span className="text-xs font-semibold text-[#2BB6A3] bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                      {comments.length}
                    </span>
                  )}
                </h2>

                {/* Input area */}
                <div className="mb-5">
                  <div className="relative">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmitComment();
                      }}
                      placeholder="أضف ملاحظة أو تعليقاً على هذا النموذج..."
                      rows={3}
                      className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all placeholder:text-text-muted resize-none leading-relaxed"
                    />
                    <span className={`absolute bottom-3 left-3 text-[11px] font-medium transition-colors ${
                      commentText.length >= MAX_COMMENT_LENGTH
                        ? "text-red-400"
                        : commentText.length > MAX_COMMENT_LENGTH * 0.8
                        ? "text-amber-400"
                        : "text-text-muted"
                    }`}>
                      {commentText.length}/{MAX_COMMENT_LENGTH}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-text-muted">Ctrl+Enter للنشر السريع</p>
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B2A4A] text-white text-xs font-bold hover:bg-[#0d3260] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send size={12} strokeWidth={2} />
                      نشر
                    </button>
                  </div>

                  {commentSubmitted && (
                    <div className="mt-2 flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                      <ThumbsUp size={13} className="text-emerald-500 flex-shrink-0" strokeWidth={2} />
                      <p className="text-xs font-medium text-emerald-700">تمت إضافة ملاحظتك بنجاح!</p>
                    </div>
                  )}
                </div>

                {/* Comments List */}
                {comments.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-border">
                    <MessageSquare size={24} className="text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-text-muted text-sm">لا توجد ملاحظات بعد</p>
                    <p className="text-text-muted text-xs mt-0.5">كن أول من يضيف ملاحظة على هذا النموذج</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="group flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-border hover:border-teal-100 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#0B2A4A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <UserCircle2 size={18} strokeWidth={1.5} className="text-[#0B2A4A]/60" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-text-secondary">أنت</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-text-muted">{formatCommentDate(comment.createdAt)}</span>
                              <button
                                onClick={() => deleteComment(template.id, comment.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 hover:text-red-500 text-text-muted transition-all"
                                title="حذف الملاحظة"
                              >
                                <Trash2 size={12} strokeWidth={2} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-text-primary leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Tags */}
          <div className="card">
            <h2 className="font-heading font-semibold text-base text-primary-500 mb-3 flex items-center gap-2">
              <Tag size={16} strokeWidth={1.75} className="text-teal" />
              الوسوم
            </h2>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span key={tag} className="badge-gray">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {/* Download Card */}
          <div className="card border-teal-200 bg-teal-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-primary-500">
                تنزيل النموذج
              </h3>
              <span className="font-bold text-lg text-[#0B2A4A]">١٠ ر.س</span>
            </div>
            {purchased ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                  <Check size={15} strokeWidth={2.5} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-700">تم الشراء — التنزيل متاح</p>
                    <p className="text-[11px] text-emerald-500 mt-0.5">يمكنك تنزيل هذا النموذج مجاناً</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDownload(template.id, "word")}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-lg bg-[#0B2A4A] text-white text-sm font-bold hover:bg-[#0d3260] transition-colors"
                  >
                    <Download size={14} strokeWidth={2} />
                    Word
                  </button>
                  <button
                    onClick={() => handleDownload(template.id, "pdf")}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-lg bg-[#2BB6A3] text-white text-sm font-bold hover:bg-teal-600 transition-colors"
                  >
                    <Download size={14} strokeWidth={2} />
                    PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => template && addItem(template)}
                  disabled={inCart}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold transition-colors border-2 ${
                    inCart
                      ? "border-[#2BB6A3] bg-teal-50 text-[#2BB6A3] cursor-default"
                      : "border-[#0B2A4A] text-[#0B2A4A] hover:bg-[#0B2A4A] hover:text-white"
                  }`}
                >
                  {inCart ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2} />}
                  {inCart ? "تمت الإضافة للسلة" : "أضف للسلة"}
                </button>

                <button
                  onClick={handleBuy}
                  disabled={buyLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-[#0B2A4A] hover:bg-[#0d3260] text-white text-sm font-bold transition-colors disabled:opacity-60"
                >
                  {buyLoading ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} strokeWidth={1.75} />}
                  {buyLoading ? "جارٍ التحويل للدفع..." : "شراء الآن — ١٠ ر.س"}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDownload(template.id, "word")}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-md border-2 border-primary-500 text-primary-500 text-xs font-semibold hover:bg-primary-50 transition-colors"
                  >
                    <Download size={13} strokeWidth={1.75} />
                    Word فقط
                  </button>
                  <button
                    onClick={() => handleDownload(template.id, "pdf")}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-md border-2 border-teal text-teal text-xs font-semibold hover:bg-teal-50 transition-colors"
                  >
                    <Download size={13} strokeWidth={1.75} />
                    PDF فقط
                  </button>
                </div>
              </div>
            )}
            {!purchased && (
              <p className="text-text-muted text-xs mt-3 text-center">
                سعر ثابت ١٠ ر.س لكل نموذج — دفع آمن عبر Stripe
              </p>
            )}
          </div>

          {/* License Notice Card */}
          <div className="card border-amber-100 bg-amber-50">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-800 mb-1">شروط الاستخدام — استخدام شخصي فقط</p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  هذا النموذج مُرخَّص للاستخدام الداخلي الشخصي أو المؤسسي فقط. يُحظر إعادة بيعه أو توزيعه أو نشره لأي طرف آخر.
                </p>
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-amber-600 underline hover:text-amber-800 mt-1 inline-block"
                >
                  قراءة شروط الاستخدام كاملة ←
                </a>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="card">
            <h3 className="font-heading font-semibold text-primary-500 text-sm mb-3">
              تفاصيل الوثيقة
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { label: "التصنيف", value: template.category.replace(/_/g, " ") },
                { label: "نوع الوثيقة", value: template.documentType.replace(/_/g, " ") },
                { label: "الجهة المستقبِلة", value: template.targetEntity.replace(/_/g, " ") },
                { label: "عدد الصفحات", value: `${template.pageCount} صفحة` },
                { label: "رقم الإصدار", value: template.version },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="text-text-primary font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Templates (by relatedIds) */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="section-title">نماذج ذات صلة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                isSaved={isSavedRelated(tpl.id)}
                onToggleSave={(tid) => {
                  if (isSavedRelated(tid)) {
                    setSavedTemplates(savedTemplates.filter((s) => s.templateId !== tid));
                  } else {
                    setSavedTemplates([...savedTemplates, { templateId: tid, savedAt: new Date().toISOString() }]);
                  }
                }}
                onDownload={handleDownload}
              />
            ))}
          </div>
        </section>
      )}

      {/* Similar Templates — same category */}
      {(() => {
        const similar = ALL_TEMPLATES
          .filter((t) => t.id !== template.id && t.category === template.category)
          .sort((a, b) => b.downloads - a.downloads)
          .slice(0, 3);

        if (similar.length === 0) return null;

        return (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-heading font-bold text-xl text-primary-500 mb-0.5">نماذج مشابهة</h2>
                <p className="text-text-muted text-sm">من نفس فئة "{template.category.replace(/_/g, " ")}"</p>
              </div>
              <Link
                to="/library"
                className="flex items-center gap-1 text-sm text-teal font-semibold hover:underline"
              >
                عرض الكل
                <ChevronLeft size={15} strokeWidth={2} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {similar.map((tpl) => {
                const simInCart = isInCart(tpl.id);
                const simPurchased = isPurchased(tpl.id);
                return (
                  <div
                    key={tpl.id}
                    className="bg-white border border-border rounded-xl overflow-hidden hover:border-teal-200 hover:shadow-md transition-all group"
                  >
                    <div className="h-2 bg-gradient-to-r from-[#0B2A4A] to-[#2BB6A3]" />

                    <div className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                        <span className="text-[10px] font-semibold text-[#2BB6A3] bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                          {tpl.category.replace(/_/g, " ")}
                        </span>
                        {tpl.isNew && (
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                            جديد
                          </span>
                        )}
                        {simPurchased && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            مشترى ✓
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/template/${tpl.id}`}
                        className="block font-heading font-semibold text-sm text-primary-500 leading-snug mb-2 hover:text-teal line-clamp-2 transition-colors"
                      >
                        {tpl.title}
                      </Link>

                      <div className="flex items-center gap-3 text-xs text-text-muted mb-3">
                        <span className="flex items-center gap-1">
                          <Star size={11} strokeWidth={1.5} className="fill-amber-400 text-amber-400" />
                          {tpl.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download size={11} strokeWidth={1.75} />
                          {tpl.downloads.toLocaleString("ar-SA")}
                        </span>
                        <span>{tpl.pageCount} ص</span>
                        {!simPurchased && (
                          <span className="mr-auto font-bold text-[#0B2A4A] text-xs">١٠ ر.س</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {simPurchased ? (
                          <>
                            {tpl.wordUrl && (
                              <a
                                href={tpl.wordUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-[#0B2A4A] text-[#0B2A4A] text-xs font-semibold hover:bg-[#0B2A4A] hover:text-white transition-colors"
                              >
                                <Download size={11} strokeWidth={2} />
                                Word
                              </a>
                            )}
                            {tpl.pdfUrl && (
                              <a
                                href={tpl.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-[#2BB6A3] text-[#2BB6A3] text-xs font-semibold hover:bg-[#2BB6A3] hover:text-white transition-colors"
                              >
                                <Download size={11} strokeWidth={2} />
                                PDF
                              </a>
                            )}
                            {!tpl.wordUrl && !tpl.pdfUrl && (
                              <Link
                                to={`/template/${tpl.id}`}
                                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              >
                                عرض النموذج
                              </Link>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => addItem(tpl)}
                              disabled={simInCart}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                simInCart
                                  ? "bg-teal-50 border border-[#2BB6A3] text-[#2BB6A3] cursor-default"
                                  : "bg-[#0B2A4A] text-white hover:bg-[#0d3260]"
                              }`}
                            >
                              {simInCart ? (
                                <><Check size={11} strokeWidth={2.5} /> في السلة</>
                              ) : (
                                <><Plus size={11} strokeWidth={2.5} /> أضف للسلة</>
                              )}
                            </button>
                            <Link
                              to={`/template/${tpl.id}`}
                              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-text-muted hover:border-teal-200 hover:text-teal transition-colors"
                              title="عرض التفاصيل"
                            >
                              <ChevronLeft size={14} strokeWidth={2} />
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* Scroll to top button */}
      <ScrollToTopButton />
    </div>
  );
}
