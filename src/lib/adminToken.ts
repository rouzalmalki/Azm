/**
 * adminToken store — يحفظ ADMIN_API_TOKEN في الذاكرة فقط (لا localStorage، لا VITE_ env).
 * يُمسح تلقائياً عند إغلاق التبويب أو تسجيل الخروج.
 */

let _token: string | null = null;

export const adminTokenStore = {
  get(): string | null {
    return _token;
  },
  set(token: string) {
    _token = token;
  },
  clear() {
    _token = null;
  },
};
