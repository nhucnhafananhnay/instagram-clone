import { useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, EmptyState, Icon, UserAvatar } from "@/components/ui";
import { FollowListModal } from "@/features/users/FollowListModal";
import { getMediaUrl } from "@/services/http/media-url";
import { getUserPosts } from "@/services/posts/post.api";
import type { PostListData, UserPostFilter } from "@/services/posts/post.types";
import { followUser, getUserProfile, unfollowUser } from "@/services/users/user.api";
import { useAuthStore } from "@/stores/use-auth-store";
import { useUiStore } from "@/stores/use-ui-store";
import type { ProfileTab } from "@/types/index.type";

export default function ProfilePage() {
  const { userId } = useParams();
  const currentUserId = useAuthStore((state) => state.user?._id);
  const targetUserId = userId === "me" ? currentUserId : userId;
  const isOwnProfile = targetUserId === currentUserId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const openPost = useUiStore((state) => state.openPost);
  const [searchParams, setSearchParams] = useSearchParams();
  const [followList, setFollowList] = useState<"followers" | "following" | null>(null);
  const requestedTab = searchParams.get("tab");
  const tab: ProfileTab =
    requestedTab === "saved" || requestedTab === "videos" ? requestedTab : "posts";
  const activeTab = !isOwnProfile && tab === "saved" ? "posts" : tab;
  const filter: UserPostFilter =
    activeTab === "videos" ? "video" : activeTab === "saved" ? "saved" : "all";

  const profileQuery = useQuery({
    queryKey: ["user-profile", targetUserId],
    queryFn: () => getUserProfile(targetUserId!),
    enabled: !!targetUserId,
    retry: false,
  });

  const postsQuery = useInfiniteQuery({
    queryKey: ["user-posts", targetUserId, filter],
    queryFn: ({ pageParam }) => getUserPosts(targetUserId!, filter, pageParam),
    enabled: !!targetUserId,
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined,
    retry: false,
  });

  const followMutation = useMutation({
    mutationFn: () =>
      profileQuery.data?.isFollowing
        ? unfollowUser(targetUserId!)
        : followUser(targetUserId!),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user-profile", targetUserId] });
      void queryClient.invalidateQueries({ queryKey: ["follow-list"] });
      void queryClient.invalidateQueries({ queryKey: ["suggested-users"] });
    },
  });

  const profile = profileQuery.data;
  const allPosts = postsQuery.data?.pages.flatMap((page) => page.posts) ?? [];
  const posts = [...new Map(allPosts.map((post) => [post._id, post])).values()];
  const allPostsCache = queryClient.getQueryData<{ pages: PostListData[] }>([
    "user-posts",
    targetUserId,
    "all",
  ]);
  const postsCount =
    profile?.postsCount ?? allPostsCache?.pages[0]?.total ?? postsQuery.data?.pages[0]?.total ?? 0;

  function openProfilePost(postId: string, mediaPath: string | null) {
    const mediaUrl = getMediaUrl(mediaPath);
    if (mediaUrl) openPost({ id: postId, mediaUrl });
  }

  function selectTab(selectedTab: ProfileTab) {
    setSearchParams(selectedTab === "posts" ? {} : { tab: selectedTab });
  }

  if (profileQuery.isPending) {
    return (
      <main className="profile-page">
        <p className="copyright">Đang tải trang cá nhân...</p>
      </main>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <main className="profile-page">
        <EmptyState
          icon="user"
          title="Không thể tải trang cá nhân"
          text="Người dùng không tồn tại hoặc đã xảy ra lỗi."
        />
      </main>
    );
  }

  return (
    <main className="profile-page">
      <header className="profile-header">
        <UserAvatar
          size={150}
          src={getMediaUrl(profile.profilePicture)}
          name={profile.fullName || profile.username}
        />
        <div className="profile-info">
          <div className="profile-title">
            <h2>{profile.username}</h2>
            {isOwnProfile ? (
              <>
                <Button variant="secondary" onClick={() => navigate("/profile")}>
                  Chỉnh sửa trang cá nhân
                </Button>
                <Button
                  variant="secondary"
                  disabled
                  title="Kho lưu trữ chưa được backend hỗ trợ"
                >
                  Xem kho lưu trữ
                </Button>
              </>
            ) : (
              <Button
                variant={profile.isFollowing ? "secondary" : "primary"}
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
              >
                {followMutation.isPending
                  ? "Đang xử lý..."
                  : profile.isFollowing
                    ? "Đang theo dõi"
                    : "Theo dõi"}
              </Button>
            )}
            <button disabled title="Tùy chọn bổ sung chưa được backend hỗ trợ">
              <Icon name="more" />
            </button>
          </div>
          <div className="stats">
            <span>
              <strong>{postsCount}</strong> bài viết
            </span>
            <button onClick={() => setFollowList("followers")}>
              <strong>{profile.followersCount}</strong> người theo dõi
            </button>
            <button onClick={() => setFollowList("following")}>
              Đang theo dõi <strong>{profile.followingCount}</strong> người dùng
            </button>
          </div>
          <strong>{profile.fullName}</strong>
          <p>
            {profile.bio}
            {profile.bio && profile.website && <br />}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer">
                {profile.website}
              </a>
            )}
          </p>
          {followMutation.isError && (
            <small className="field-error">Không thể cập nhật theo dõi. Vui lòng thử lại.</small>
          )}
        </div>
      </header>

      <div className="profile-tabs">
        <button
          className={activeTab === "posts" ? "active" : ""}
          onClick={() => selectTab("posts")}
        >
          <Icon name="grid" size={13} /> BÀI VIẾT
        </button>
        {isOwnProfile && (
          <button
            className={activeTab === "saved" ? "active" : ""}
            onClick={() => selectTab("saved")}
          >
            <Icon name="bookmark" size={13} /> ĐÃ LƯU
          </button>
        )}
        <button
          className={activeTab === "videos" ? "active" : ""}
          onClick={() => selectTab("videos")}
        >
          <Icon name="film" size={13} /> VIDEO
        </button>
      </div>

      {postsQuery.isPending && <p className="copyright">Đang tải bài viết...</p>}
      {postsQuery.isError && (
        <EmptyState icon="grid" title="Không thể tải bài viết" text="Vui lòng thử lại." />
      )}
      {posts.length > 0 && (
        <div className="profile-grid">
          {posts.map((post) => {
            const mediaPath = post.image || post.video;
            const mediaUrl = getMediaUrl(mediaPath);
            const commentsCount =
              typeof post.comments === "number" ? post.comments : post.comments.length;

            return (
              <button key={post._id} onClick={() => openProfilePost(post._id, mediaPath)}>
                {post.mediaType === "video" ? (
                  <video
                    src={mediaUrl}
                    muted
                    preload="metadata"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <img src={mediaUrl} alt={post.caption || "Bài viết"} />
                )}
                <span>
                  ♥ {post.likes}　◯ {commentsCount}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {postsQuery.isSuccess && posts.length === 0 && (
        <EmptyState
          icon={activeTab === "saved" ? "bookmark" : activeTab === "videos" ? "film" : "grid"}
          title={
            activeTab === "saved"
              ? "Lưu"
              : activeTab === "videos"
                ? "Chia sẻ video"
                : "Chưa có bài viết"
          }
          text={
            activeTab === "saved"
              ? "Lưu ảnh và video mà bạn muốn xem lại."
              : activeTab === "videos"
                ? "Video bạn chia sẻ sẽ xuất hiện trên trang cá nhân."
                : "Bài viết được chia sẻ sẽ xuất hiện tại đây."
          }
        />
      )}
      {postsQuery.hasNextPage && (
        <Button
          variant="secondary"
          onClick={() => postsQuery.fetchNextPage()}
          disabled={postsQuery.isFetchingNextPage}
        >
          {postsQuery.isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
        </Button>
      )}

      {followList && (
        <FollowListModal
          userId={profile._id}
          type={followList}
          close={() => setFollowList(null)}
        />
      )}
    </main>
  );
}
