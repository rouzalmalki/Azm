import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Mail,
  FileText,
  BarChart2,
  Landmark,
  Users,
  Handshake,
  Award,
  FolderKanban,
} from "lucide-react";
import type { CategoryItem } from "@/types";

const ICON_MAP: Record<string, React.ElementType> = {
  calendar: Calendar,
  mail: Mail,
  "file-text": FileText,
  "bar-chart-2": BarChart2,
  landmark: Landmark,
  users: Users,
  handshake: Handshake,
  award: Award,
  "folder-kanban": FolderKanban,
};

interface CategoryGridProps {
  categories: CategoryItem[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {categories.map((cat) => {
        const Icon = ICON_MAP[cat.icon] || FileText;
        return (
          <button
            key={cat.id}
            onClick={() => navigate(`/library?category=${cat.id}`)}
            className={`card-hover flex flex-col items-start gap-3 p-4 border text-right w-full ${cat.color} bg-opacity-50`}
          >
            <div className="w-9 h-9 rounded-md bg-white bg-opacity-70 flex items-center justify-center">
              <Icon size={18} strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-heading font-semibold text-sm leading-tight mb-0.5">
                {cat.label}
              </p>
              <p className="text-xs opacity-70">{cat.count} نموذج</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
