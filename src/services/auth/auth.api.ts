import { apiRequest } from "@/services/http/http-client";
import type {
  ApiResponse,
  AuthUser,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenData,
  RegisterData,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailData,
} from "@/services/auth/auth.types";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiRequest<BackendLoginData>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return {
    ...response,
    data: {
      user: response.data.user,
      accessToken: response.data.tokens.accessToken,
      refreshToken: response.data.tokens.refreshToken,
    },
  };
}

export async function registerAccount(data: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterData>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  return apiRequest<null>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function resetPassword(
  token: string,
  data: ResetPasswordRequest,
): Promise<ApiResponse<null>> {
  return apiRequest<null>(`/api/auth/reset-password/${encodeURIComponent(token)}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyEmail(token: string): Promise<ApiResponse<VerifyEmailData>> {
  return apiRequest<VerifyEmailData>(`/api/auth/verify-email/${encodeURIComponent(token)}`, {
    method: "POST",
  });
}

export async function resendVerificationEmail(
  data: ResendVerificationRequest,
): Promise<ApiResponse<null>> {
  return apiRequest<null>("/api/auth/resend-verification-email", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<ApiResponse<RefreshTokenData>> {
  return apiRequest<RefreshTokenData>("/api/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logoutAccount(
  accessToken: string,
  refreshToken: string,
): Promise<ApiResponse<null>> {
  return apiRequest<null>("/api/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });
}

export async function getCurrentUserProfile(accessToken: string): Promise<ApiResponse<AuthUser>> {
  return apiRequest<AuthUser>("/api/users/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

interface BackendLoginData {
  user: AuthUser;
  tokens: RefreshTokenData;
}
