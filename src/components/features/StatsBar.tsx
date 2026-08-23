import { FileText, Download, Building2 } from "lucide-react";

interface StatsBarProps {
  templates: number;
  downloads: number;
  associations: number;
}

export default function StatsBar({ templates, downloads, associations }: StatsBarProps) {
  const stats = [
    {
      icon: FileText,
      value: templates.toLocaleString("ar-SA"),
      label: "نموذج متاح",
    },
    {
      icon: Download,
      value: downloads.toLocaleString("ar-SA") + "+",
      label: "تنزيل مكتمل",
    },
    {
      icon: Building2,
      value: associations.toLocaleString("ar-SA") + "+",
      label: "عملاء",
    },
  ];

  return (
    <div className="bg-primary-500 rounded-lg px-2 py-4">
      <div className="grid grid-cols-3 divide-x divide-x-reverse divide-primary-400">
        {stats.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 px-4 py-2">
            <s.icon size={20} strokeWidth={1.5} className="text-teal-300 mb-0.5" />
            <span className="font-heading font-bold text-white text-2xl leading-none">
              {s.value}
            </span>
            <span className="text-primary-200 text-xs text-center">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
