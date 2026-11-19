import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/use-auth-store";

export default function AuthGuard() {
  const location = useLocation();
  const status = useAuthStore((state) => state.status);

  if (status === "restoring") {
    return (
      <div className="auth-loading" role="status">
        Đang khôi phục phiên...
      </div>
    );
  }
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
