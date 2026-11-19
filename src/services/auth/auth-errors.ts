import { HttpError } from "@/services/http/http-client";

export function getLoginErrorMessage(error: unknown): string {
  if (!(error instanceof HttpError)) return "Đã xảy ra lỗi. Vui lòng thử lại.";
  if (error.code === "NETWORK_ERROR")
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.";

  const backendMessage = error.message.toLowerCase();
  if (backendMessage.includes("verif")) {
    return "Vui lòng xác thực email trước khi đăng nhập.";
  }

  switch (error.status) {
    case 400:
      return "Thông tin đăng nhập chưa hợp lệ.";
    case 401:
      return "Email hoặc mật khẩu không đúng.";
    case 403:
      return "Tài khoản không có quyền đăng nhập.";
    case 404:
      return "Không tìm thấy dịch vụ đăng nhập.";
    case 409:
      return "Tài khoản đang có xung đột. Vui lòng thử lại sau.";
    case 500:
      return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
    default:
      return error.status && error.status >= 500
        ? "Máy chủ đang tạm thời không khả dụng."
        : "Không thể đăng nhập. Vui lòng thử lại.";
  }
}

export function getVerifyEmailErrorMessage(error: unknown): string {
  if (!(error instanceof HttpError)) return "Không thể xác thực email. Vui lòng thử lại.";
  if (error.code === "NETWORK_ERROR") {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.";
  }
  if (error.status === 400 || error.status === 401) {
    return "Liên kết xác thực không hợp lệ hoặc đã hết hạn.";
  }
  return "Không thể xác thực email. Vui lòng thử lại.";
}

export function getForgotPasswordErrorMessage(error: unknown): string {
  if (!(error instanceof HttpError)) return "Không thể gửi email khôi phục mật khẩu.";
  if (error.code === "NETWORK_ERROR") {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.";
  }

  const backendMessage = error.message.toLowerCase();
  if (error.status === 404 || backendMessage.includes("not found")) {
    return "Không tìm thấy tài khoản với email này.";
  }
  if (error.status === 400) return "Email chưa hợp lệ. Vui lòng kiểm tra lại.";
  if (error.status !== null && error.status >= 500) {
    return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  }
  return "Không thể gửi email khôi phục mật khẩu. Vui lòng thử lại.";
}

export function getResetPasswordErrorMessage(error: unknown): string {
  if (!(error instanceof HttpError)) return "Không thể đặt lại mật khẩu.";
  if (error.code === "NETWORK_ERROR") {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.";
  }
  if (error.status === 400 || error.status === 401 || error.status === 404) {
    return "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";
  }
  return error.status !== null && error.status >= 500
    ? "Máy chủ đang gặp sự cố. Vui lòng thử lại sau."
    : "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
}

export function getResendVerificationErrorMessage(error: unknown): string {
  if (!(error instanceof HttpError)) return "Không thể gửi lại email xác thực.";
  if (error.code === "NETWORK_ERROR") {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.";
  }
  const backendMessage = error.message.toLowerCase();
  if (error.status === 404 || backendMessage.includes("not found")) {
    return "Không tìm thấy tài khoản với email này.";
  }
  if (error.status === 400) return "Email không hợp lệ hoặc tài khoản đã được xác thực.";
  return "Không thể gửi lại email xác thực. Vui lòng thử lại.";
}

export function getRegisterErrorMessage(error: unknown): string {
  if (!(error instanceof HttpError)) return "Đã xảy ra lỗi. Vui lòng thử lại.";
  if (error.code === "NETWORK_ERROR")
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.";

  const backendMessage = error.message.toLowerCase();
  if (
    backendMessage.includes("email") &&
    (backendMessage.includes("exist") ||
      backendMessage.includes("use") ||
      backendMessage.includes("already") ||
      backendMessage.includes("registered") ||
      backendMessage.includes("duplicate"))
  ) {
    return "Email này đã được sử dụng.";
  }
  if (
    backendMessage.includes("username") &&
    (backendMessage.includes("exist") ||
      backendMessage.includes("taken") ||
      backendMessage.includes("already") ||
      backendMessage.includes("duplicate"))
  ) {
    return "Tên người dùng này đã tồn tại.";
  }

  switch (error.status) {
    case 400:
      return "Thông tin đăng ký chưa hợp lệ. Vui lòng kiểm tra lại.";
    case 409:
      return "Email hoặc tên người dùng đã tồn tại.";
    case 500:
      return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
    default:
      return error.status && error.status >= 500
        ? "Máy chủ đang tạm thời không khả dụng."
        : "Không thể đăng ký. Vui lòng thử lại.";
  }
}
