import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Icon, InputField } from "@/components/ui";
import { useResetPasswordMutation } from "@/features/auth/hooks/use-reset-password-mutation";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/schemas/auth.schema";
import { getResetPasswordErrorMessage } from "@/services/auth/auth-errors";

export default function ResetPasswordPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const resetMutation = useResetPasswordMutation(token);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function handleResetPassword(data: ResetPasswordFormValues) {
    if (!token || resetMutation.isPending) return;
    resetMutation.mutate(data);
  }

  return (
    <main className="forgot-page">
      <form className="forgot-card" onSubmit={handleSubmit(handleResetPassword)} noValidate>
        <div className="lock-circle">
          <Icon name="lock" size={36} />
        </div>
        <h1>Đặt lại mật khẩu</h1>
        <p>Nhập mật khẩu mới cho tài khoản của bạn.</p>

        <InputField
          placeholder="Mật khẩu mới"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <InputField
          placeholder="Xác nhận mật khẩu"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {resetMutation.isError && (
          <div className="auth-error" role="alert">
            {getResetPasswordErrorMessage(resetMutation.error)}
          </div>
        )}
        {resetMutation.isSuccess && (
          <div className="auth-success" role="status">
            Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.
          </div>
        )}

        {!resetMutation.isSuccess && (
          <Button type="submit" disabled={!token || resetMutation.isPending}>
            {resetMutation.isPending ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
          </Button>
        )}
        <button
          className="auth-link"
          type="button"
          onClick={() => navigate("/login", { replace: true })}
        >
          {resetMutation.isSuccess ? "Đi đến đăng nhập" : "Quay lại đăng nhập"}
        </button>
      </form>
    </main>
  );
}
