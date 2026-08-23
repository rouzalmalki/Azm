/**
 * useTemplates — merges static templates from data.ts with DB templates from OnSpace Cloud
 *
 * Priority: DB templates override static ones with the same ID.
 * New DB-only templates are prepended to the list.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TEMPLATES as STATIC_TEMPLATES } from "@/constants/data";
import type { Template, TemplateCategory, DocumentType, TargetEntity } from "@/types";

// Map a raw DB row to the Template interface
function mapDbRow(row: Record<string, unknown>): Template {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    category: (row.category as TemplateCategory),
    documentType: (row.document_type as DocumentType),
    targetEntity: (row.target_entity as TargetEntity),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    lastUpdated: (row.last_updated as string) ?? new Date().toISOString().split("T")[0],
    downloads: (row.downloads as number) ?? 0,
    rating: parseFloat(String(row.rating ?? 0)),
    isNew: (row.is_new as boolean) ?? false,
    isFeatured: (row.is_featured as boolean) ?? false,
    wordUrl: (row.word_url as string) ?? undefined,
    pdfUrl: (row.pdf_url as string) ?? undefined,
    previewText: (row.preview_text as string) ?? "",
    relatedIds: Array.isArray(row.related_ids) ? (row.related_ids as string[]) : [],
    pageCount: (row.page_count as number) ?? 1,
    version: (row.version as string) ?? "1.0",
  };
}

export interface UseTemplatesResult {
  templates: Template[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useTemplates(): UseTemplatesResult {
  const [dbTemplates, setDbTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFromDb = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("[useTemplates] fetch error:", dbError.message);
      setError(dbError.message);
      setDbTemplates([]);
    } else {
      const mapped = (data ?? []).map((row) => mapDbRow(row as Record<string, unknown>));
      console.log(`[useTemplates] fetched ${mapped.length} templates from DB`);
      setDbTemplates(mapped);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFromDb();
  }, [fetchFromDb]);

  // Merge: DB templates take priority; then append static ones not present in DB
  const dbIds = new Set(dbTemplates.map((t) => t.id));
  const staticOnly = STATIC_TEMPLATES.filter((t) => !dbIds.has(t.id));
  const templates = [...dbTemplates, ...staticOnly];

  return { templates, loading, error, refresh: fetchFromDb };
}
