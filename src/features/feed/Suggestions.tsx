import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Icon, UserAvatar } from "@/components/ui";
import { getMediaUrl } from "@/services/http/media-url";
import { followUser, getSuggestedUsers, unfollowUser } from "@/services/users/user.api";
import type { SuggestedUser } from "@/services/users/user.types";
import { useAuthStore } from "@/stores/use-auth-store";
import { useUiStore } from "@/stores/use-ui-store";

function SuggestedUserRow({ user }: { user: SuggestedUser }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?._id);
  const [following, setFollowing] = useState(user.isFollowing);

  const followMutation = useMutation({
    mutationFn: () => (following ? unfollowUser(user._id) : followUser(user._id)),
    retry: false,
    onSuccess: () => {
      setFollowing(!following);
      void queryClient.invalidateQueries({ queryKey: ["suggested-users"] });
      void queryClient.invalidateQueries({ queryKey: ["user-profile", user._id] });
      void queryClient.invalidateQueries({ queryKey: ["follow-list"] });
    },
  });

  function openProfile() {
    navigate(`/user/${user._id}`);
  }

  function toggleFollow() {
    if (followMutation.isPending || user._id === currentUserId) return;
    followMutation.mutate();
  }

  return (
    <div className="user-row">
      <button onClick={openProfile}>
        <UserAvatar src={getMediaUrl(user.profilePicture)} size={34} />
      </button>
      <button className="user-copy" onClick={openProfile}>
        <strong>{user.username}</strong>
        <span>{followMutation.isError ? "Không thể cập nhật" : user.fullName}</span>
      </button>
      {user._id !== currentUserId && (
        <button className="text-action" onClick={toggleFollow} disabled={followMutation.isPending}>
          {following ? "Đang theo dõi" : "Theo dõi"}
        </button>
      )}
    </div>
  );
}

export function Suggestions() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const setMessagesOpen = useUiStore((state) => state.setMessagesOpen);
  const suggestedQuery = useQuery({
    queryKey: ["suggested-users"],
    queryFn: () => getSuggestedUsers(5),
  });

  return (
    <aside className="suggestions">
      {currentUser && (
        <button className="user-row" onClick={() => navigate("/user/me")}>
          <UserAvatar src={getMediaUrl(currentUser.profilePicture)} size={44} />
          <span className="user-copy">
            <strong>{currentUser.username}</strong>
            <span>{currentUser.fullName}</span>
          </span>
        </button>
      )}
      <div className="suggestions-heading">
        <strong>Gợi ý cho bạn</strong>
        <button disabled title="Backend chưa có API danh sách gợi ý đầy đủ">
          Xem tất cả
        </button>
      </div>
      {suggestedQuery.isPending && <p className="copyright">Đang tải gợi ý...</p>}
      {suggestedQuery.isError && <p className="auth-error">Không thể tải gợi ý.</p>}
      {suggestedQuery.data?.map((user) => (
        <SuggestedUserRow key={user._id} user={user} />
      ))}
      <p className="meta-links">
        Giới thiệu · Trợ giúp · Báo chí · API · Việc làm
        <br />
        Quyền riêng tư · Điều khoản · Vị trí
      </p>
      <p className="copyright">© 2026 INSTAGRAM FROM META</p>
      <button className="floating-message" onClick={() => setMessagesOpen(true)}>
        <Icon name="message" size={20} /> Tin nhắn
      </button>
    </aside>
  );
}
