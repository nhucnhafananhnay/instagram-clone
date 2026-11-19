import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui";
import { queryClient } from "@/providers/query-client";
import { logoutAccount } from "@/services/auth/auth.api";
import type { AuthSession } from "@/services/auth/auth.types";
import { useAuthStore } from "@/stores/use-auth-store";

export function MoreMenu({ close }: { close: () => void }) {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);
  const logoutMutation = useMutation({
    mutationFn: (currentSession: AuthSession) =>
      logoutAccount(currentSession.accessToken, currentSession.refreshToken),
    retry: false,
  });

  async function handleLogout() {
    try {
      if (session) await logoutMutation.mutateAsync(session);
    } finally {
      // Luôn xóa phiên local, kể cả khi server đang mất kết nối.
      logout();
      queryClient.clear();
      close();
      navigate("/login", { replace: true });
    }
  }

  function openSavedPosts() {
    close();
    navigate("/user/me?tab=saved");
  }

  return (
    <>
      <button className="menu-scrim" onClick={close} aria-label="Đóng menu" />
      <div className="more-menu">
        <button onClick={openSavedPosts}>
          <Icon name="bookmark" /> Đã lưu
        </button>
        <button disabled title="Chuyển giao diện chưa được hỗ trợ">
          <span className="theme-icon">◐</span> Chuyển chế độ
        </button>
        <div />
        <button onClick={handleLogout} disabled={logoutMutation.isPending}>
          {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>
      </div>
    </>
  );
}
