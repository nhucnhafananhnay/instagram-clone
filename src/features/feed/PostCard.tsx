import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Icon, UserAvatar } from "@/components/ui";
import { getMediaUrl } from "@/services/http/media-url";
import { likePost, savePost, unlikePost, unsavePost } from "@/services/posts/post.api";
import type { PostItem } from "@/services/posts/post.types";

interface PostCardProps {
  post: PostItem;
  onOpen: () => void;
}

export function PostCard({ post, onOpen }: PostCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(post.isLiked);
  const [saved, setSaved] = useState(post.isSaved);
  const [likesCount, setLikesCount] = useState(post.likes);
  const mediaUrl = getMediaUrl(post.image || post.video) ?? "";
  const commentsCount = Array.isArray(post.comments) ? post.comments.length : post.comments;

  const likeMutation = useMutation({
    mutationFn: () => (liked ? unlikePost(post._id) : likePost(post._id)),
    retry: false,
    onSuccess: () => {
      setLikesCount((count) => Math.max(0, count + (liked ? -1 : 1)));
      setLiked(!liked);
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["explore"] });
      void queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      void queryClient.invalidateQueries({ queryKey: ["post", post._id] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => (saved ? unsavePost(post._id) : savePost(post._id)),
    retry: false,
    onSuccess: () => {
      setSaved(!saved);
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["explore"] });
      void queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      void queryClient.invalidateQueries({ queryKey: ["post", post._id] });
    },
  });

  function openAuthorProfile() {
    navigate(`/user/${post.userId._id}`);
  }

  function toggleLike() {
    if (liked === undefined || likeMutation.isPending) return;
    likeMutation.mutate();
  }

  function toggleSave() {
    if (saved === undefined || saveMutation.isPending) return;
    saveMutation.mutate();
  }

  return (
    <article className="post-card">
      <header className="post-header">
        <button onClick={openAuthorProfile} aria-label={`Mở trang của ${post.userId.username}`}>
          <UserAvatar src={getMediaUrl(post.userId.profilePicture)} size={34} />
        </button>
        <div>
          <button onClick={openAuthorProfile}>
            <strong>{post.userId.username}</strong>
          </button>
          <span> · {new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
        </div>
        <button onClick={onOpen} aria-label="Mở tùy chọn bài viết">
          <Icon name="more" />
        </button>
      </header>
      <button className="post-media" onClick={onOpen}>
        {post.mediaType === "video" ? (
          <video
            src={mediaUrl}
            controls
            preload="metadata"
            style={{ width: "100%", maxHeight: 620, background: "#000" }}
          />
        ) : (
          <img src={mediaUrl} alt={`Bài viết của ${post.userId.username}`} />
        )}
      </button>
      <div className="post-actions">
        <button
          className={liked ? "liked" : ""}
          onClick={toggleLike}
          disabled={liked === undefined || likeMutation.isPending}
        >
          <Icon name="heart" fill={liked === true} />
        </button>
        <button onClick={onOpen}>
          <Icon name="comment" />
        </button>
        <button disabled title="Chức năng chia sẻ chưa được backend hỗ trợ">
          <Icon name="send" />
        </button>
        <button
          className={`save ${saved ? "saved" : ""}`}
          onClick={toggleSave}
          disabled={saved === undefined || saveMutation.isPending}
        >
          <Icon name="bookmark" fill={saved === true} />
        </button>
      </div>
      <strong className="likes">{likesCount} lượt thích</strong>
      <p className="caption">
        <strong>{post.userId.username}</strong> {post.caption}
      </p>
      <button className="view-comments" onClick={onOpen}>
        Xem tất cả {commentsCount} bình luận
      </button>
      {(likeMutation.isError || saveMutation.isError) && (
        <small className="auth-error">Không thể cập nhật bài viết. Vui lòng thử lại.</small>
      )}
      <button className="quick-comment" onClick={onOpen}>
        <span>Thêm bình luận...</span>
        <Icon name="smile" size={14} />
      </button>
    </article>
  );
}
