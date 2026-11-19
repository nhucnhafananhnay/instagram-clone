import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import AuthGuard from "@/routes/AuthGuard";
import GuestOnlyRoute from "@/routes/GuestOnlyRoute";

const MainLayout = lazy(() => import("@/layouts/MainLayout"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const EditProfilePage = lazy(() => import("@/pages/EditProfilePage"));
const ExplorePage = lazy(() => import("@/pages/ExplorePage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/VerifyEmailPage"));

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="auth-loading">Đang tải...</div>}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route element={<GuestOnlyRoute />}>
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
          </Route>
          <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        </Route>
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/user/:userId" element={<ProfilePage />} />
            <Route path="/profile" element={<EditProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
