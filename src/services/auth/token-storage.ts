import type { AuthSession } from "@/services/auth/auth.types";

const SESSION_KEY = "instagram.auth.session";

// Đọc thời gian hết hạn bên trong access token.
export function isTokenExpired(token: string): boolean {
  const payload = token.split(".")[1];
  if (!payload) return false;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(
      atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")),
    ) as { exp?: number };
    return typeof decoded.exp === "number" && decoded.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

export function saveSession(session: AuthSession) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ứng dụng vẫn giữ phiên trong Zustand nếu trình duyệt chặn storage.
  }
}

export function getSession(): AuthSession | null {
  try {
    const savedSession = sessionStorage.getItem(SESSION_KEY);

    if (!savedSession) return null;

    const session = JSON.parse(savedSession) as AuthSession;
    const hasSession = session.user && session.accessToken && session.refreshToken;

    if (!hasSession) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Không cần xử lý thêm nếu trình duyệt chặn storage.
  }
}
