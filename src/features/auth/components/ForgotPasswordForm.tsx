import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button, Icon, InputField } from "@/components/ui";
import { useForgotPasswordMutation } from "@/features/auth/hooks/use-forgot-password-mutation";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/schemas/auth.schema";
import { getForgotPasswordErrorMessage } from "@/services/auth/auth-errors";

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const forgotPasswordMutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  function goToLogin() {
    navigate("/login");
  }

  function handleForgotPassword(data: ForgotPasswordFormValues) {
    if (forgotPasswordMutation.isPending) return;
    forgotPasswordMutation.mutate(data);
  }

  return (
    <main className="forgot-page">
      <form className="forgot-card" onSubmit={handleSubmit(handleForgotPassword)} noValidate>
        <div className="lock-circle">
          <Icon name="lock" size={36} />
        </div>
        <h1>Quên mật khẩu?</h1>
        <p>Nhập email của bạn và chúng tôi sẽ gửi cho bạn liên kết để truy cập lại tài khoản.</p>
        <InputField
          placeholder="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        {forgotPasswordMutation.isError && (
          <div className="auth-error" role="alert">
            {getForgotPasswordErrorMessage(forgotPasswordMutation.error)}
          </div>
        )}

        {forgotPasswordMutation.isSuccess && (
          <div className="auth-success" role="status">
            Email khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.
          </div>
        )}

        <Button
          type="submit"
          disabled={forgotPasswordMutation.isPending || forgotPasswordMutation.isSuccess}
        >
          {forgotPasswordMutation.isPending ? "Đang gửi..." : "Gửi email reset"}
        </Button>
        <button className="auth-link" type="button" onClick={goToLogin}>
          Quay lại đăng nhập
        </button>
      </form>
    </main>
  );
}
