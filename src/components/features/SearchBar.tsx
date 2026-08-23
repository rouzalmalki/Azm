import { useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SUGGESTED_KEYWORDS } from "@/constants/data";

interface SearchBarProps {
  initialValue?: string;
  onSearch?: (query: string) => void;
  navigateOnSearch?: boolean;
  placeholder?: string;
  size?: "large" | "normal";
}

export default function SearchBar({
  initialValue = "",
  onSearch,
  navigateOnSearch = false,
  placeholder = "ابحث عن نموذج أو خطاب...",
  size = "normal",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navigateOnSearch) {
      navigate(`/library?q=${encodeURIComponent(query)}`);
    } else {
      onSearch?.(query);
    }
  };

  const handleSuggestion = (kw: string) => {
    setQuery(kw);
    if (navigateOnSearch) {
      navigate(`/library?q=${encodeURIComponent(kw)}`);
    } else {
      onSearch?.(kw);
    }
  };

  const isLarge = size === "large";

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search
            size={isLarge ? 22 : 18}
            strokeWidth={1.75}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!navigateOnSearch) onSearch?.(e.target.value);
            }}
            placeholder={placeholder}
            className={`input-field pr-12 pl-16 ${
              isLarge ? "text-lg py-4" : "py-3"
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                if (!navigateOnSearch) onSearch?.("");
              }}
              className="absolute left-12 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-primary-500 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-teal text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-teal-500 transition-colors"
          >
            بحث
          </button>
        </div>
      </form>

      {isLarge && (
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-sm text-text-muted flex-shrink-0 self-center">
            مقترحات:
          </span>
          {SUGGESTED_KEYWORDS.map((kw) => (
            <button
              key={kw}
              onClick={() => handleSuggestion(kw)}
              className="px-3 py-1.5 bg-white text-text-secondary text-sm rounded-full border border-border hover:border-teal-300 hover:text-teal hover:bg-teal-50 transition-colors"
            >
              {kw}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
