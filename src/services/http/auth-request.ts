import { refreshAccessToken } from "@/services/auth/auth.api";
import type { ApiResponse } from "@/services/auth/auth.types";
import { apiRequest, HttpError } from "@/services/http/http-client";
import { useAuthStore } from "@/stores/use-auth-store";

let refreshPromise: Promise<string> | null = null;

export async function authRequest<T>(path: string, options: RequestInit): Promise<ApiResponse<T>> {
  const session = useAuthStore.getState().session;

  if (!session) {
    throw new HttpError("Bạn cần đăng nhập để tiếp tục.", 401, "HTTP_ERROR");
  }

  try {
    return await sendRequest<T>(path, options, session.accessToken);
  } catch (error) {
    if (!(error instanceof HttpError) || error.status !== 401) throw error;

    try {
      const latestSession = useAuthStore.getState().session;

      // Một request khác có thể vừa refresh token xong.
      if (latestSession && latestSession.accessToken !== session.accessToken) {
        return await sendRequest<T>(path, options, latestSession.accessToken);
      }

      const accessToken = await refreshSession(session.refreshToken);
      return await sendRequest<T>(path, options, accessToken);
    } catch {
      // Không tự đăng xuất chỉ vì một API nền thất bại. Điều này tránh mất phiên
      // khi nhiều request cùng lúc nhận 401 từ backend.
      throw error;
    }
  }
}

async function refreshSession(refreshToken: string): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(refreshToken)
      .then((response) => {
        const session = useAuthStore.getState().session;

        if (!session) throw new HttpError("Bạn cần đăng nhập để tiếp tục.", 401, "HTTP_ERROR");

        useAuthStore.getState().setSession({
          user: session.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });
        return response.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function sendRequest<T>(path: string, options: RequestInit, accessToken: string) {
  return apiRequest<T>(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
