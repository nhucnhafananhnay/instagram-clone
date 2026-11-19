import { create } from "zustand";
import { getCurrentUserProfile, refreshAccessToken } from "@/services/auth/auth.api";
import { HttpError } from "@/services/http/http-client";
import {
  clearSession,
  getSession,
  isTokenExpired,
  saveSession,
} from "@/services/auth/token-storage";
import type { AuthSession, AuthUser } from "@/services/auth/auth.types";

export type AuthStatus = "restoring" | "authenticated" | "unauthenticated";

interface AuthStore {
  status: AuthStatus;
  user: AuthUser | null;
  session: AuthSession | null;
  restoreSession: () => Promise<void>;
  setSession: (session: AuthSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  status: "restoring",
  user: null,
  session: null,
  restoreSession: async () => {
    const savedSession = getSession();

    if (!savedSession) {
      set({ status: "unauthenticated", user: null, session: null });
      return;
    }

    try {
      let currentSession = savedSession;
      let tokenWasRefreshed = false;

      if (isTokenExpired(currentSession.accessToken)) {
        currentSession = await renewSession(currentSession);
        tokenWasRefreshed = true;
      }

      try {
        const profileResponse = await getCurrentUserProfile(currentSession.accessToken);
        currentSession = { ...currentSession, user: profileResponse.data };
      } catch (error) {
        // Access token có thể bị backend thu hồi trước thời gian hết hạn.
        if (!(error instanceof HttpError) || error.status !== 401 || tokenWasRefreshed) {
          throw error;
        }

        currentSession = await renewSession(currentSession);
        const profileResponse = await getCurrentUserProfile(currentSession.accessToken);
        currentSession = { ...currentSession, user: profileResponse.data };
      }

      saveSession(currentSession);
      set({ status: "authenticated", user: currentSession.user, session: currentSession });
    } catch (error) {
      const serverUnavailable =
        error instanceof HttpError &&
        (error.code === "NETWORK_ERROR" || (error.status !== null && error.status >= 500));

      if (serverUnavailable) {
        // Không xóa storage khi lỗi chỉ đến từ mạng hoặc máy chủ tạm ngưng.
        if (!isTokenExpired(savedSession.accessToken)) {
          set({ status: "authenticated", user: savedSession.user, session: savedSession });
        } else {
          set({ status: "unauthenticated", user: null, session: null });
        }
        return;
      }

      clearSession();
      set({ status: "unauthenticated", user: null, session: null });
    }
  },
  setSession: (session) => {
    saveSession(session);
    set({ status: "authenticated", user: session.user, session });
  },
  logout: () => {
    clearSession();
    set({ status: "unauthenticated", user: null, session: null });
  },
}));

async function renewSession(session: AuthSession): Promise<AuthSession> {
  const response = await refreshAccessToken(session.refreshToken);

  return {
    user: session.user,
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  };
}
