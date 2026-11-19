import { Logo } from "@/components/ui";
import { photos } from "@/constants/mock-data";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import LoginForm from "@/features/auth/components/LoginForm";
import RegisterForm from "@/features/auth/components/RegisterForm";
import type { AuthMode } from "@/types/index.type";

type AuthPageProps = {
  mode: AuthMode;
};

export default function AuthPage({ mode }: AuthPageProps) {
  if (mode === "forgot") {
    return <ForgotPasswordForm />;
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="collage-card back">
          <img src={photos[2]} alt="" />
        </div>
        <div className="collage-card front">
          <img src={photos[5]} alt="" />
        </div>
        <div className="collage-card side">
          <img src={photos[0]} alt="" />
        </div>
        <span className="sticker heart-sticker">♥</span>
        <span className="sticker reaction">🔥 💜</span>
        <span className="sticker verified">★ ✓</span>
      </section>

      <section className="auth-form">
        <Logo />
        {mode === "login" ? <LoginForm /> : <RegisterForm />}
      </section>

      <footer className="auth-footer">
        Meta　 Giới thiệu　 Blog　 Việc làm　 Trợ giúp　 API　 Quyền riêng tư　 Điều khoản
        <br />
        <span>© 2026 Instagram from Meta</span>
      </footer>
    </main>
  );
}
