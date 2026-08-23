import { useState, useRef } from "react";
import { Briefcase, Upload, FileText, CheckCircle, X, MapPin, Clock, Building2, ChevronLeft, AlertCircle } from "lucide-react";

const JOB_LISTINGS = [

{
  id: "j2",
  title: "محاسب",
  org: "منصة عزم لحوكمة الوثائق والنماذج",
  location: "جدة",
  type: "عن بُعد",
  category: "الشؤون المالية",
  deadline: "2026-11-21",
  color: "bg-indigo-50 text-indigo-700 border-indigo-200"
},
{
  id: "j5",
  title: "منسق شراكات ومبادرات",
  org: "منصة عزم لحوكمة الوثائق والنماذج",
  location: "جدة",
  type: "عن بُعد",
  category: "الشراكات",
  deadline: "2026-11-21",
  color: "bg-sky-50 text-sky-700 border-sky-200"
},
{
  id: "j7",
  title: "أخصائي دعم العملاء",
  org: "منصة عزم لحوكمة الوثائق والنماذج",
  location: "جدة",
  type: "عن بُعد",
  category: "دعم العملاء",
  deadline: "2026-11-21",
  color: "bg-amber-50 text-amber-700 border-amber-200"
}];



type UploadState = "idle" | "uploading" | "success" | "error";

interface FormData {
  name: string;
  email: string;
  phone: string;
  jobId: string;
  note: string;
}

export default function Jobs() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState<FormData>({ name: "", email: "", phone: "", jobId: "", note: "" });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadState("error");
      setUploadedFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadState("error");
      setUploadedFile(null);
      return;
    }
    setUploadedFile(file);
    setUploadState("uploading");
    setTimeout(() => setUploadState("success"), 1200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const openForm = (jobId: string) => {
    setSelectedJob(jobId);
    setForm({ name: "", email: "", phone: "", jobId, note: "" });
    setUploadedFile(null);
    setUploadState("idle");
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "مطلوب";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "بريد غير صحيح";
    if (!form.phone.trim()) e.phone = "مطلوب";
    if (uploadState !== "success") e.note = "يرجى رفع السيرة الذاتية";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    console.log("Submitting application:", { form, file: uploadedFile?.name });
    setShowForm(false);
    setSelectedJob("submitted");
  };

  const selectedJobData = JOB_LISTINGS.find((j) => j.id === selectedJob);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full mb-3">
          فرص العمل في منصة عزم
        </div>
        <h1 className="font-heading font-bold text-3xl text-[#0B2A4A] mb-2">
          التوظيف
        </h1>
        <p className="text-gray-500 text-base max-w-xl">تصفّح الفرص الوظيفية المتاحة في منصة عزم لحوكمة الوثائق والنماذج وقدّم سيرتك الذاتية مباشرةً.

        </p>
      </div>

      {/* Success Message */}
      {selectedJob === "submitted" &&
      <div className="mb-6 flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-700 text-sm">تم استلام طلبك بنجاح!</p>
            <p className="text-emerald-600 text-xs mt-0.5">سيتواصل معك فريق الجمعية خلال 3–5 أيام عمل.</p>
          </div>
        </div>
      }

      {/* Job Listings Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {JOB_LISTINGS.map((job) =>
        <div
          key={job.id}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col">
          
            {/* Category badge */}
            <span className={`inline-flex self-start text-xs font-medium px-2.5 py-1 rounded-full border mb-4 ${job.color}`}>
              {job.category}
            </span>

            <h3 className="font-heading font-bold text-[#0B2A4A] text-base mb-1 leading-snug">
              {job.title}
            </h3>

            <div className="space-y-1.5 mt-2 flex-1">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Building2 size={13} strokeWidth={1.75} className="flex-shrink-0" />
                {job.org}
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <MapPin size={13} strokeWidth={1.75} className="flex-shrink-0" />
                {job.location}
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Clock size={13} strokeWidth={1.75} className="flex-shrink-0" />
                {job.type}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">
                آخر موعد: {job.deadline}
              </span>
              <button
              onClick={() => openForm(job.id)}
              className="flex items-center gap-1.5 bg-[#0B2A4A] hover:bg-[#0d3360] text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
              
                قدّم الآن
                <ChevronLeft size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Application Form Modal */}
      {showForm && selectedJobData &&
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h2 className="font-heading font-bold text-[#0B2A4A] text-base">تقديم الطلب</h2>
                <p className="text-xs text-gray-400 mt-0.5">{selectedJobData.title} — {selectedJobData.org}</p>
              </div>
              <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  الاسم الكامل <span className="text-red-400">*</span>
                </label>
                <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="مثال: محمد العمري"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-all ${errors.name ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-teal-400"}`} />
              
                {errors.name && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  البريد الإلكتروني <span className="text-red-400">*</span>
                </label>
                <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="example@email.com"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-all ${errors.email ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-teal-400"}`}
                dir="ltr" />
              
                {errors.email && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  رقم الجوال <span className="text-red-400">*</span>
                </label>
                <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="05xxxxxxxx"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-all ${errors.phone ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-teal-400"}`}
                dir="ltr" />
              
                {errors.phone && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.phone}</p>}
              </div>

              {/* CV Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  السيرة الذاتية (PDF) <span className="text-red-400">*</span>
                </label>

                {uploadState === "success" && uploadedFile ?
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <FileText size={17} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-emerald-700 truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-emerald-500 mt-0.5">
                        {(uploadedFile.size / 1024).toFixed(0)} KB — تم الرفع بنجاح
                      </p>
                    </div>
                    <button
                  type="button"
                  onClick={() => {setUploadedFile(null);setUploadState("idle");}}
                  className="p-1 text-emerald-400 hover:text-emerald-600 rounded">
                  
                      <X size={15} />
                    </button>
                  </div> :
              uploadState === "uploading" ?
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <Upload size={17} className="text-blue-500" />
                    </div>
                    <p className="text-sm text-blue-600">جارٍ الرفع...</p>
                  </div> :

              <div
                onDragOver={(e) => {e.preventDefault();setDragOver(true);}}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragOver ?
                "border-teal-400 bg-teal-50" :
                uploadState === "error" ?
                "border-red-300 bg-red-50" :
                "border-gray-200 hover:border-teal-300 hover:bg-gray-50"}`
                }>
                
                    <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${uploadState === "error" ? "bg-red-100" : "bg-[#0B2A4A]/5"}`}>
                      {uploadState === "error" ?
                  <AlertCircle size={22} className="text-red-400" /> :

                  <Upload size={22} className="text-[#0B2A4A]/50" />
                  }
                    </div>
                    {uploadState === "error" ?
                <p className="text-sm text-red-500 font-medium">صيغة غير مدعومة أو الحجم أكبر من 5 MB</p> :

                <>
                        <p className="text-sm font-medium text-gray-700">اسحب ملف PDF هنا أو انقر للاختيار</p>
                        <p className="text-xs text-gray-400 mt-1">PDF فقط · الحد الأقصى 5 MB</p>
                      </>
                }
                    <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);}} />
                
                  </div>
              }
                {errors.note && uploadState !== "success" &&
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />يرجى رفع السيرة الذاتية</p>
              }
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">ملاحظات إضافية (اختياري)</label>
                <textarea
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="أي معلومات إضافية تودّ إضافتها..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 transition-all resize-none" />
              
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-1">
                <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                
                  إلغاء
                </button>
                <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg bg-[#2BB6A3] hover:bg-teal-600 text-white text-sm font-semibold transition-colors">
                
                  إرسال الطلب
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>);

}