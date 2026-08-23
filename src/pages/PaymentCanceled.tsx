import { Link, useNavigate } from "react-router-dom";
import { XCircle, RefreshCw, ArrowRight } from "lucide-react";

export default function PaymentCanceled() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <XCircle size={32} className="text-red-400" />
        </div>
        <h1 className="font-heading font-bold text-2xl text-[#0B2A4A] mb-2">
          تم إلغاء عملية الدفع
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          لم تُكتمل عملية الدفع. يمكنك المحاولة مرةً أخرى في أي وقت.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0B2A4A] text-white text-sm font-semibold hover:bg-navy-700 transition-colors"
          >
            <RefreshCw size={15} />
            حاول مرة أخرى
          </button>
          <Link
            to="/library"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowRight size={15} className="rtl-flip" />
            العودة للمكتبة
          </Link>
        </div>
      </div>
    </div>
  );
}
