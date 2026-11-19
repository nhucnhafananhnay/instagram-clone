import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const registerSchema = loginSchema
  .extend({
    username: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập tên người dùng")
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Tên người dùng chỉ được chứa chữ, số, dấu gạch dưới hoặc gạch ngang",
      ),
    fullName: z.string().trim().min(1, "Vui lòng nhập họ và tên"),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu")
      .min(8, "Mật khẩu cần ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu cần có ít nhất một chữ hoa")
      .regex(/[a-z]/, "Mật khẩu cần có ít nhất một chữ thường")
      .regex(/[0-9]/, "Mật khẩu cần có ít nhất một chữ số"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận chưa khớp",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mật khẩu cần ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu cần có ít nhất một chữ hoa")
      .regex(/[a-z]/, "Mật khẩu cần có ít nhất một chữ thường")
      .regex(/[0-9]/, "Mật khẩu cần có ít nhất một chữ số"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận chưa khớp",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResendVerificationFormValues = z.infer<typeof resendVerificationSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
