import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthRedirectPath } from "@/routes/auth-redirect";
import { useAuthStore } from "@/stores/use-auth-store";

export default function GuestOnlyRoute() {
  const location = useLocation();
  const status = useAuthStore((state) => state.status);

  if (status === "restoring") {
    return (
      <div className="auth-loading" role="status">
        Đang khôi phục phiên...
      </div>
    );
  }
  if (status === "authenticated") {
    return <Navigate to={getAuthRedirectPath(location.state)} replace />;
  }
  return <Outlet />;
}
