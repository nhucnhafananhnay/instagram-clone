import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Icon, InputField } from "@/components/ui";
import { useLoginMutation } from "@/features/auth/hooks/use-login-mutation";
import { getAuthRedirectPath } from "@/routes/auth-redirect";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { getLoginErrorMessage } from "@/services/auth/auth-errors";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function handleLogin(data: LoginFormValues) {
    loginMutation.mutate(data, {
      onSuccess: handleLoginSuccess,
    });
  }

  function handleLoginSuccess() {
    const nextPage = getAuthRedirectPath(location.state);
    navigate(nextPage, { replace: true });
  }

  function togglePassword() {
    setShowPassword(!showPassword);
  }

  function goToRegister() {
    navigate("/register");
  }

  function goToForgotPassword() {
    navigate("/forgot-password");
  }

  return (
    <form onSubmit={handleSubmit(handleLogin)} noValidate>
      <div className="fields">
        <InputField
          placeholder="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <div className="password-field">
          <InputField
            placeholder="Mật khẩu"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            className="password-toggle"
            type="button"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            onClick={togglePassword}
          >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
        </div>
      </div>

      {loginMutation.isError && (
        <p className="auth-error" role="alert">
          {getLoginErrorMessage(loginMutation.error)}
        </p>
      )}

      <Button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <div className="or">
        <span />
        HOẶC
        <span />
      </div>

      <button
        className="facebook-login"
        type="button"
        disabled
        title="Đăng nhập Facebook chưa được backend hỗ trợ"
      >
        <Icon name="facebook" size={18} /> Đăng nhập bằng Facebook
      </button>
      <button className="forgot-link" type="button" onClick={goToForgotPassword}>
        Quên mật khẩu?
      </button>
      <p className="switch-auth">
        Bạn chưa có tài khoản?{" "}
        <button type="button" onClick={goToRegister}>
          Đăng ký
        </button>
      </p>
    </form>
  );
}
