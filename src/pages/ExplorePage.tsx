import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { EmptyState, Icon } from "@/components/ui";
import { getMediaUrl } from "@/services/http/media-url";
import { getExplore } from "@/services/posts/post.api";
import { useUiStore } from "@/stores/use-ui-store";

const POSTS_PER_PAGE = 20;

export default function ExplorePage() {
  const openPost = useUiStore((state) => state.openPost);
  const exploreQuery = useInfiniteQuery({
    queryKey: ["explore"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getExplore(pageParam, POSTS_PER_PAGE),
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
  });

  const allPosts = exploreQuery.data?.pages.flatMap((page) => page.posts) ?? [];
  const posts = [...new Map(allPosts.map((post) => [post._id, post])).values()];

  useEffect(() => {
    function loadNextPage() {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (nearBottom && exploreQuery.hasNextPage && !exploreQuery.isFetchingNextPage) {
        void exploreQuery.fetchNextPage();
      }
    }

    window.addEventListener("scroll", loadNextPage);
    return () => window.removeEventListener("scroll", loadNextPage);
  }, [exploreQuery]);

  if (exploreQuery.isPending) {
    return (
      <main className="explore-grid">
        <EmptyState icon="image" title="Đang tải" text="Đang lấy bài viết khám phá..." />
      </main>
    );
  }

  if (exploreQuery.isError) {
    return (
      <main className="explore-grid">
        <EmptyState
          icon="image"
          title="Không thể tải trang khám phá"
          text="Vui lòng kiểm tra kết nối và thử lại."
          action="Thử lại"
          onAction={() => void exploreQuery.refetch()}
        />
      </main>
    );
  }

  if (posts.length === 0) {
    return (
      <main className="explore-grid">
        <EmptyState icon="image" title="Chưa có bài viết" text="Trang khám phá hiện đang trống." />
      </main>
    );
  }

  return (
    <main className="explore-grid">
      {posts.map((post, index) => {
        const mediaUrl = getMediaUrl(post.image || post.video) ?? "";
        return (
          <button
            className={index === 2 || index === 7 ? "tall" : ""}
            key={post._id}
            onClick={() => openPost({ id: post._id, mediaUrl })}
          >
            {post.mediaType === "video" ? (
              <video
                src={mediaUrl}
                muted
                playsInline
                preload="metadata"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <img src={mediaUrl} alt={post.caption || "Bài viết khám phá"} />
            )}
            <span>
              <b>♥ {post.likes}</b>
              <b>◯ {Array.isArray(post.comments) ? post.comments.length : post.comments}</b>
            </span>
            {post.mediaType === "video" && (
              <i>
                <Icon name="film" size={20} />
              </i>
            )}
          </button>
        );
      })}
    </main>
  );
}
