/**
 * Template view tracking utilities
 * Records page visits and download events to template_views table
 */
import { supabase } from "@/lib/supabase";

// Generate or retrieve a stable anonymous session ID
export function getSessionId(): string {
  const key = "azm_session_id";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

export interface ViewRecord {
  id: string;
  template_id: string;
  template_title: string;
  session_id: string;
  viewed_at: string;
  downloaded: boolean;
  download_format: string | null;
  time_spent_seconds: number | null;
}

/**
 * Insert a view record when a template page is opened.
 * Returns the inserted row id so we can update it later (download flag, time_spent).
 */
export async function recordTemplateView(
  templateId: string,
  templateTitle: string
): Promise<string | null> {
  const sessionId = getSessionId();
  const { data, error } = await supabase
    .from("template_views")
    .insert({
      template_id: templateId,
      template_title: templateTitle,
      session_id: sessionId,
      downloaded: false,
      download_format: null,
      time_spent_seconds: null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("recordTemplateView error:", error.message);
    return null;
  }
  return data?.id ?? null;
}

/**
 * Update an existing view record with download info.
 */
export async function markViewDownloaded(
  viewId: string,
  format: "word" | "pdf" | "both"
): Promise<void> {
  const { error } = await supabase
    .from("template_views")
    .update({ downloaded: true, download_format: format })
    .eq("id", viewId);

  if (error) console.error("markViewDownloaded error:", error.message);
}

/**
 * Update time_spent_seconds on unmount.
 */
export async function updateTimeSpent(
  viewId: string,
  seconds: number
): Promise<void> {
  const { error } = await supabase
    .from("template_views")
    .update({ time_spent_seconds: seconds })
    .eq("id", viewId);

  if (error) console.error("updateTimeSpent error:", error.message);
}

// ─── Analytics Queries ────────────────────────────────────────────────────────

export type Period = "7d" | "30d" | "90d";

function periodStart(period: Period): string {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export interface ConversionStats {
  uniqueVisitors: number;
  downloaders: number;
  nonDownloaders: number;
  avgTimeMinutes: number;
  bounceRate: number;
}

export async function fetchConversionStats(period: Period): Promise<ConversionStats> {
  const since = periodStart(period);

  const { data, error } = await supabase
    .from("template_views")
    .select("session_id, downloaded, time_spent_seconds")
    .gte("viewed_at", since);

  if (error || !data) {
    console.error("fetchConversionStats error:", error?.message);
    return { uniqueVisitors: 0, downloaders: 0, nonDownloaders: 0, avgTimeMinutes: 0, bounceRate: 0 };
  }

  const sessionMap: Record<string, { downloaded: boolean; times: number[] }> = {};

  for (const row of data) {
    if (!sessionMap[row.session_id]) {
      sessionMap[row.session_id] = { downloaded: false, times: [] };
    }
    if (row.downloaded) sessionMap[row.session_id].downloaded = true;
    if (row.time_spent_seconds != null) sessionMap[row.session_id].times.push(row.time_spent_seconds);
  }

  const sessions = Object.values(sessionMap);
  const uniqueVisitors = sessions.length;
  const downloaders = sessions.filter((s) => s.downloaded).length;
  const nonDownloaders = uniqueVisitors - downloaders;

  const allTimes = sessions.flatMap((s) => s.times);
  const avgTimeSec = allTimes.length > 0 ? allTimes.reduce((a, b) => a + b, 0) / allTimes.length : 0;
  const avgTimeMinutes = parseFloat((avgTimeSec / 60).toFixed(1));

  // Bounce = sessions with only 1 view and 0 downloads and time_spent < 30s
  const bounced = sessions.filter(
    (s) => !s.downloaded && (s.times.length === 0 || s.times[0] < 30)
  ).length;
  const bounceRate = uniqueVisitors > 0 ? Math.round((bounced / uniqueVisitors) * 100) : 0;

  return { uniqueVisitors, downloaders, nonDownloaders, avgTimeMinutes, bounceRate };
}

export interface DailyTrend {
  day: string;
  visitors: number;
  downloaders: number;
}

export async function fetchDailyTrend(period: Period): Promise<DailyTrend[]> {
  const since = periodStart(period);

  const { data, error } = await supabase
    .from("template_views")
    .select("session_id, downloaded, viewed_at")
    .gte("viewed_at", since)
    .order("viewed_at", { ascending: true });

  if (error || !data) return [];

  const buckets: Record<string, { visitors: Set<string>; downloaders: Set<string> }> = {};

  for (const row of data) {
    const date = new Date(row.viewed_at);
    let key: string;

    if (period === "7d") {
      key = date.toLocaleDateString("ar-SA", { weekday: "short" });
    } else if (period === "30d") {
      key = `${date.getDate()}/${date.getMonth() + 1}`;
    } else {
      const weekNum = Math.floor((date.getTime() - new Date(since).getTime()) / (7 * 24 * 3600 * 1000)) + 1;
      key = `الأسبوع ${weekNum}`;
    }

    if (!buckets[key]) buckets[key] = { visitors: new Set(), downloaders: new Set() };
    buckets[key].visitors.add(row.session_id);
    if (row.downloaded) buckets[key].downloaders.add(row.session_id);
  }

  return Object.entries(buckets).map(([day, b]) => ({
    day,
    visitors: b.visitors.size,
    downloaders: b.downloaders.size,
  }));
}

export interface TopUndownloaded {
  template_id: string;
  template_title: string;
  views: number;
  downloads: number;
  dropRate: number;
}

// ─── Performance Report Queries ──────────────────────────────────────────────

export interface TopDownloaded {
  template_id: string;
  template_title: string;
  downloads: number;
  views: number;
  conversionRate: number;
}

export async function fetchTopDownloaded(period: Period): Promise<TopDownloaded[]> {
  const since = periodStart(period);

  const { data, error } = await supabase
    .from("template_views")
    .select("template_id, template_title, downloaded")
    .gte("viewed_at", since);

  if (error || !data) return [];

  const map: Record<string, { title: string; views: number; downloads: number }> = {};

  for (const row of data) {
    if (!map[row.template_id]) {
      map[row.template_id] = { title: row.template_title, views: 0, downloads: 0 };
    }
    map[row.template_id].views++;
    if (row.downloaded) map[row.template_id].downloads++;
  }

  return Object.entries(map)
    .map(([id, v]) => ({
      template_id: id,
      template_title: v.title,
      downloads: v.downloads,
      views: v.views,
      conversionRate: v.views > 0 ? Math.round((v.downloads / v.views) * 100) : 0,
    }))
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 10);
}

export interface CategoryStat {
  category: string;
  downloads: number;
  views: number;
}

export async function fetchDownloadsByCategory(
  period: Period,
  categoryMap: Record<string, string>
): Promise<CategoryStat[]> {
  const since = periodStart(period);

  const { data, error } = await supabase
    .from("template_views")
    .select("template_id, downloaded")
    .gte("viewed_at", since);

  if (error || !data) return [];

  const map: Record<string, { downloads: number; views: number }> = {};

  for (const row of data) {
    const cat = categoryMap[row.template_id] ?? "أخرى";
    if (!map[cat]) map[cat] = { downloads: 0, views: 0 };
    map[cat].views++;
    if (row.downloaded) map[cat].downloads++;
  }

  return Object.entries(map)
    .map(([category, v]) => ({ category, downloads: v.downloads, views: v.views }))
    .sort((a, b) => b.downloads - a.downloads);
}

export async function fetchTotalDownloads(period: Period): Promise<number> {
  const since = periodStart(period);
  const { count, error } = await supabase
    .from("template_views")
    .select("id", { count: "exact", head: true })
    .eq("downloaded", true)
    .gte("viewed_at", since);
  if (error) return 0;
  return count ?? 0;
}

export async function fetchTopUndownloaded(period: Period): Promise<TopUndownloaded[]> {
  const since = periodStart(period);

  const { data, error } = await supabase
    .from("template_views")
    .select("template_id, template_title, downloaded")
    .gte("viewed_at", since);

  if (error || !data) return [];

  const map: Record<string, { title: string; views: number; downloads: number }> = {};

  for (const row of data) {
    if (!map[row.template_id]) {
      map[row.template_id] = { title: row.template_title, views: 0, downloads: 0 };
    }
    map[row.template_id].views++;
    if (row.downloaded) map[row.template_id].downloads++;
  }

  return Object.entries(map)
    .map(([id, v]) => ({
      template_id: id,
      template_title: v.title,
      views: v.views,
      downloads: v.downloads,
      dropRate: v.views > 0 ? Math.round(((v.views - v.downloads) / v.views) * 100) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
}
