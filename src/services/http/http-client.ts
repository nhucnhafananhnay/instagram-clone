import type { ApiResponse } from "@/services/auth/auth.types";

type ErrorCode = "NETWORK_ERROR" | "INVALID_RESPONSE" | "HTTP_ERROR";

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly code: ErrorCode,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

export async function apiRequest<T>(path: string, options: RequestInit): Promise<ApiResponse<T>> {
  if (!apiBaseUrl) {
    throw new HttpError("Thiếu cấu hình VITE_API_BASE_URL.", null, "INVALID_RESPONSE");
  }

  let response: Response;

  try {
    const isFormData = options.body instanceof FormData;

    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });
  } catch {
    throw new HttpError("Không thể kết nối đến máy chủ.", null, "NETWORK_ERROR");
  }

  let result: ApiResponse<T>;

  try {
    result = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new HttpError("Phản hồi từ máy chủ không hợp lệ.", response.status, "INVALID_RESPONSE");
  }

  if (!response.ok || !result.success) {
    const message = result.message || "Yêu cầu không thành công.";
    throw new HttpError(message, response.status, "HTTP_ERROR");
  }

  // Một số API như logout trả data là null, nhưng data không được phép bị thiếu.
  if (result.data === undefined) {
    throw new HttpError("Phản hồi từ máy chủ không hợp lệ.", response.status, "INVALID_RESPONSE");
  }

  return result;
}
