export interface Template {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  documentType: DocumentType;
  targetEntity: TargetEntity;
  tags: string[];
  lastUpdated: string;
  downloads: number;
  rating: number;
  isNew: boolean;
  isFeatured: boolean;
  wordUrl?: string;
  pdfUrl?: string;
  relatedIds: string[];
  pageCount: number;
  version: string;
}

export type TemplateCategory =
  | "إدارة_الاجتماعات"
  | "المراسلات_الرسمية"
  | "اللوائح_والسياسات"
  | "التقارير_والإحصاء"
  | "الشؤون_المالية"
  | "الموارد_البشرية"
  | "الشراكات_والتعاون"
  | "الاعتراف_والتقدير"
  | "الشكر_والتقدير"
  | "البرامج_والمشاريع";

export type DocumentType =
  | "محضر_اجتماع"
  | "خطاب_رسمي"
  | "لائحة_داخلية"
  | "تقرير"
  | "نموذج_تقديم"
  | "عقد_وتفويض"
  | "إعلان_ونشرة"
  | "شهادة_وتكريم";

export type TargetEntity =
  | "وزارة_الموارد_البشرية"
  | "المركز_الوطني_لتنمية_القطاع_غير_الربحي"
  | "مجلس_الإدارة"
  | "الجمعية_العمومية"
  | "الجهات_التمويلية"
  | "الشركاء_والجهات_الأخرى"
  | "داخلي";

export interface CategoryItem {
  id: TemplateCategory;
  label: string;
  icon: string;
  count: number;
  color: string;
}

export interface AssessmentResult {
  id: string;
  filename: string;
  date: string;
  overallScore: number;
  formality: number;
  completeness: number;
  formatting: number;
  language: number;
  notes: AssessmentNote[];
  suggestedTemplateId?: string;
}

export interface AssessmentNote {
  type: "error" | "warning" | "success";
  field: string;
  message: string;
}

export interface UserProfile {
  name: string;
  associationName: string;
  licenseNumber: string;
  city: string;
  email: string;
  phone: string;
  logo?: string;
}

export interface DownloadRecord {
  templateId: string;
  templateTitle: string;
  date: string;
  format: "word" | "pdf";
}

export interface SavedTemplate {
  templateId: string;
  savedAt: string;
}

export interface FilterState {
  category: TemplateCategory | "all";
  documentType: DocumentType | "all";
  targetEntity: TargetEntity | "all";
  sortBy: "newest" | "mostDownloaded" | "rating";
  search: string;
}
