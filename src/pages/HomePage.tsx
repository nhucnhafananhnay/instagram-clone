import { useInfiniteQuery } from "@tanstack/react-query";
import { Button, EmptyState } from "@/components/ui";
import { PostCard } from "@/features/feed/PostCard";
import { Stories } from "@/features/feed/Stories";
import { Suggestions } from "@/features/feed/Suggestions";
import { getMediaUrl } from "@/services/http/media-url";
import { getFeed } from "@/services/posts/post.api";
import { useUiStore } from "@/stores/use-ui-store";

const POSTS_PER_PAGE = 10;

export default function HomePage() {
  const openPost = useUiStore((state) => state.openPost);
  const feedQuery = useInfiniteQuery({
    queryKey: ["feed"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getFeed(pageParam, POSTS_PER_PAGE),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined,
  });

  const posts = feedQuery.data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <main className="home-layout">
      <section className="feed">
        <Stories />

        {feedQuery.isPending && (
          <EmptyState icon="image" title="Đang tải" text="Đang lấy bài viết mới nhất..." />
        )}

        {feedQuery.isError && (
          <EmptyState
            icon="image"
            title="Không thể tải bảng tin"
            text="Vui lòng kiểm tra kết nối và thử lại."
            action="Thử lại"
            onAction={() => void feedQuery.refetch()}
          />
        )}

        {!feedQuery.isPending && !feedQuery.isError && posts.length === 0 && (
          <EmptyState icon="image" title="Chưa có bài viết" text="Bảng tin hiện đang trống." />
        )}

        {posts.map((post) => {
          const mediaUrl = getMediaUrl(post.image || post.video) ?? "";
          return (
            <PostCard
              key={`${post._id}-${post.isLiked}-${post.isSaved}-${post.likes}`}
              post={post}
              onOpen={() => openPost({ id: post._id, mediaUrl })}
            />
          );
        })}

        {feedQuery.hasNextPage && (
          <Button
            onClick={() => void feedQuery.fetchNextPage()}
            disabled={feedQuery.isFetchingNextPage}
          >
            {feedQuery.isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
          </Button>
        )}
      </section>
      <Suggestions />
    </main>
  );
}
