import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center mb-5">
        <span className="font-heading font-bold text-3xl text-primary-300">؟</span>
      </div>
      <h1 className="font-heading font-bold text-2xl text-primary-500 mb-2">
        الصفحة غير موجودة
      </h1>
      <p className="text-text-secondary text-base mb-6">
        الرابط الذي تحاول الوصول إليه غير موجود أو تمّت إزالته.
      </p>
      <Link to="/" className="btn-primary">
        العودة إلى الرئيسية
      </Link>
    </div>
  );
}
