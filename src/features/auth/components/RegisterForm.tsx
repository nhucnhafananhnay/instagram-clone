import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button, InputField } from "@/components/ui";
import { useRegisterMutation } from "@/features/auth/hooks/use-register-mutation";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth.schema";
import { getRegisterErrorMessage } from "@/services/auth/auth-errors";

export default function RegisterForm() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  function handleRegister(data: RegisterFormValues) {
    if (registerMutation.isPending) return;
    registerMutation.mutate(data, {
      onSuccess: () => {
        navigate("/verify-email", { state: { email: data.email } });
      },
    });
  }

  function goToLogin() {
    navigate("/login");
  }

  return (
    <form onSubmit={handleSubmit(handleRegister)} noValidate>
      <div className="fields">
        <InputField
          placeholder="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <InputField
          placeholder="Tên người dùng"
          autoComplete="username"
          error={errors.username?.message}
          {...register("username")}
        />
        <InputField
          placeholder="Họ và tên"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <InputField
          placeholder="Mật khẩu"
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
      </div>

      {registerMutation.isError && (
        <p className="auth-error" role="alert">
          {getRegisterErrorMessage(registerMutation.error)}
        </p>
      )}

      <Button type="submit" disabled={registerMutation.isPending}>
        {registerMutation.isPending ? "Đang đăng ký..." : "Đăng ký"}
      </Button>

      <p className="switch-auth">
        Bạn đã có tài khoản?{" "}
        <button type="button" onClick={goToLogin}>
          Đăng nhập
        </button>
      </p>
    </form>
  );
}
