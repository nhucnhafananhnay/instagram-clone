import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button, EmptyState, Modal, UserAvatar } from "@/components/ui";
import { getMediaUrl } from "@/services/http/media-url";
import { getFollowers, getFollowing } from "@/services/users/user.api";

interface FollowListModalProps {
  userId: string;
  type: "followers" | "following";
  close: () => void;
}

export function FollowListModal({ userId, type, close }: FollowListModalProps) {
  const navigate = useNavigate();
  const title = type === "followers" ? "Người theo dõi" : "Đang theo dõi";

  const listQuery = useInfiniteQuery({
    queryKey: ["follow-list", type, userId],
    queryFn: async ({ pageParam }) => {
      if (type === "followers") {
        const data = await getFollowers(userId, pageParam);
        return { users: data.followers, pagination: data.pagination };
      }

      const data = await getFollowing(userId, pageParam);
      return { users: data.following, pagination: data.pagination };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.currentPage + 1 : undefined,
    retry: false,
  });

  const users = listQuery.data?.pages.flatMap((page) => page.users) ?? [];

  function openProfile(id: string) {
    close();
    navigate(`/user/${id}`);
  }

  return (
    <Modal title={title} close={close}>
      <div className="comments" style={{ maxHeight: "65vh" }}>
        {listQuery.isPending && <p>Đang tải danh sách...</p>}
        {listQuery.isError && (
          <EmptyState icon="user" title="Không thể tải danh sách" text="Vui lòng thử lại." />
        )}
        {users.map((user) => (
          <button className="user-row" key={user._id} onClick={() => openProfile(user._id)}>
            <UserAvatar
              src={getMediaUrl(user.profilePicture)}
              name={user.fullName || user.username}
              size={44}
            />
            <span className="user-copy">
              <strong>{user.username}</strong>
              <span>{user.fullName}</span>
            </span>
          </button>
        ))}
        {listQuery.isSuccess && users.length === 0 && (
          <EmptyState icon="user" title="Chưa có người dùng" text="Danh sách này đang trống." />
        )}
        {listQuery.hasNextPage && (
          <Button
            variant="secondary"
            onClick={() => listQuery.fetchNextPage()}
            disabled={listQuery.isFetchingNextPage}
          >
            {listQuery.isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
          </Button>
        )}
      </div>
    </Modal>
  );
}
