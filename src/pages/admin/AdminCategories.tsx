import { useState } from "react";
import { Edit2, Trash2, Plus, FileText, X } from "lucide-react";
import { CATEGORIES } from "@/constants/data";
import type { CategoryItem } from "@/types";

const ICON_OPTIONS = [
  "calendar", "mail", "file-text", "bar-chart-2", "landmark",
  "users", "handshake", "award", "folder", "shield",
];

const COLOR_OPTIONS = [
  { label: "أزرق", value: "bg-blue-50 border-blue-200 text-blue-700" },
  { label: "زمردي", value: "bg-teal-50 border-teal-200 text-teal-700" },
  { label: "نيلي", value: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  { label: "بنفسجي", value: "bg-violet-50 border-violet-200 text-violet-700" },
  { label: "أخضر", value: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { label: "سماوي", value: "bg-sky-50 border-sky-200 text-sky-700" },
  { label: "عنبري", value: "bg-amber-50 border-amber-200 text-amber-700" },
  { label: "وردي", value: "bg-rose-50 border-rose-200 text-rose-700" },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>(CATEGORIES);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ label: "", icon: "file-text", count: "", color: COLOR_OPTIONS[0].value });

  const handleDeleteConfirm = () => {
    if (deleteId) {
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleAdd = () => {
    if (!form.label.trim()) return;
    const newCat: CategoryItem = {
      id: form.label.replace(/\s+/g, "_"),
      label: form.label,
      icon: form.icon,
      count: parseInt(form.count) || 0,
      color: form.color,
    };
    setCategories((prev) => [...prev, newCat]);
    setForm({ label: "", icon: "file-text", count: "", color: COLOR_OPTIONS[0].value });
    setShowAdd(false);
  };

  const startEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setForm({ label: cat.label, icon: cat.icon, count: cat.count.toString(), color: cat.color });
  };

  const handleEditSave = () => {
    if (!form.label.trim() || !editingId) return;
    setCategories((prev) =>
      prev.map((c) =>
        c.id === editingId
          ? { ...c, label: form.label, icon: form.icon, count: parseInt(form.count) || 0, color: form.color }
          : c
      )
    );
    setEditingId(null);
    setForm({ label: "", icon: "file-text", count: "", color: COLOR_OPTIONS[0].value });
  };

  const activeForm = showAdd || editingId !== null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-2xl text-[#0B2A4A]">إدارة التصنيفات</h2>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} تصنيف</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditingId(null); }}
          className="flex items-center gap-2 bg-[#2BB6A3] hover:bg-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          إضافة تصنيف
        </button>
      </div>

      {/* Add / Edit Form */}
      {activeForm && (
        <div className="bg-white rounded-xl border border-teal-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-semibold text-[#0B2A4A]">
              {editingId ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
            </h3>
            <button
              onClick={() => { setShowAdd(false); setEditingId(null); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">اسم التصنيف *</label>
              <input
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="مثال: الوثائق القانونية"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">عدد النماذج</label>
              <input
                type="number"
                value={form.count}
                onChange={(e) => setForm((f) => ({ ...f, count: e.target.value }))}
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">الأيقونة</label>
              <select
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                {ICON_OPTIONS.map((ic) => (
                  <option key={ic} value={ic}>{ic}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">اللون</label>
              <select
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                {COLOR_OPTIONS.map((co) => (
                  <option key={co.value} value={co.value}>{co.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => { setShowAdd(false); setEditingId(null); }}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={editingId ? handleEditSave : handleAdd}
              className="px-5 py-2 rounded-lg bg-[#0B2A4A] hover:bg-[#0d3360] text-white text-sm font-medium transition-colors"
            >
              {editingId ? "حفظ التعديلات" : "إضافة التصنيف"}
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${cat.color}`}>
                <FileText size={12} />
                {cat.label}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(cat)}
                  className="p-1.5 rounded-md text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setDeleteId(cat.id)}
                  className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-heading font-bold text-[#0B2A4A]">{cat.count}</p>
              <p className="text-xs text-gray-400 mt-0.5">نموذج متاح</p>
            </div>
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full"
                style={{ width: `${Math.min((cat.count / 35) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-heading font-bold text-[#0B2A4A] text-lg text-center mb-2">حذف التصنيف</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              هل تريد حذف هذا التصنيف نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
