import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Icon, InputField } from "@/components/ui";
import { useResendVerificationMutation } from "@/features/auth/hooks/use-resend-verification-mutation";
import { useVerifyEmailMutation } from "@/features/auth/hooks/use-verify-email-mutation";
import { resendVerificationSchema, type ResendVerificationFormValues } from "@/schemas/auth.schema";
import {
  getResendVerificationErrorMessage,
  getVerifyEmailErrorMessage,
} from "@/services/auth/auth-errors";

interface VerifyEmailState {
  email?: string;
}

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams();
  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();
  const verifyToken = verifyMutation.mutate;
  const requestedToken = useRef<string | null>(null);
  const locationState = location.state as VerifyEmailState | null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendVerificationFormValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: locationState?.email ?? "",
    },
  });

  useEffect(() => {
    if (!token || requestedToken.current === token) return;

    // React Strict Mode có thể chạy effect hai lần nên cần ghi nhớ token đã gửi.
    requestedToken.current = token;
    verifyToken(token);
  }, [token, verifyToken]);

  function handleResend(data: ResendVerificationFormValues) {
    if (resendMutation.isPending) return;
    resendMutation.mutate(data);
  }

  function goToLogin() {
    navigate("/login", { replace: true });
  }

  let title = "Kiểm tra email của bạn";
  let message = "Chúng tôi đã gửi liên kết xác thực. Hãy kiểm tra hộp thư trước khi đăng nhập.";

  if (token && verifyMutation.isPending) {
    title = "Đang xác thực email...";
    message = "Vui lòng chờ trong giây lát.";
  }

  if (verifyMutation.isSuccess) {
    title = "Xác thực thành công";
    message = "Email của bạn đã được xác thực. Bây giờ bạn có thể đăng nhập.";
  }

  if (verifyMutation.isError) {
    title = "Xác thực thất bại";
    message = getVerifyEmailErrorMessage(verifyMutation.error);
  }

  return (
    <main className="forgot-page">
      <form className="forgot-card" onSubmit={handleSubmit(handleResend)} noValidate>
        <div className="lock-circle">
          <Icon name="lock" size={36} />
        </div>
        <h1>{title}</h1>
        <p role="status">{message}</p>

        {!verifyMutation.isSuccess && !verifyMutation.isPending && (
          <>
            <InputField
              placeholder="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />

            {resendMutation.isError && (
              <div className="auth-error" role="alert">
                {getResendVerificationErrorMessage(resendMutation.error)}
              </div>
            )}

            {resendMutation.isSuccess && (
              <div className="auth-success" role="status">
                Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.
              </div>
            )}

            <Button type="submit" disabled={resendMutation.isPending}>
              {resendMutation.isPending ? "Đang gửi..." : "Gửi lại email xác thực"}
            </Button>
          </>
        )}

        <button className="auth-link" type="button" onClick={goToLogin}>
          {verifyMutation.isSuccess ? "Đi đến đăng nhập" : "Quay lại đăng nhập"}
        </button>
      </form>
    </main>
  );
}
