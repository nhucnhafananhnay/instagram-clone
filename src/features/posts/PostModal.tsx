import { useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { EmptyState, Icon, UserAvatar } from "@/components/ui";
import { getMediaUrl } from "@/services/http/media-url";
import {
  createComment,
  createReply,
  deleteComment,
  deletePost,
  getPostComments,
  getPostDetails,
  likeComment,
  likePost,
  savePost,
  unlikeComment,
  unlikePost,
  unsavePost,
  updateComment,
  updatePost,
} from "@/services/posts/post.api";
import type { PostComment } from "@/services/posts/post.types";
import { useAuthStore } from "@/stores/use-auth-store";

interface PostModalProps {
  postId?: string;
  mediaUrl: string;
  close: () => void;
}

export function PostModal({ postId, mediaUrl, close }: PostModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?._id);
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<PostComment | null>(null);
  const [showPostActions, setShowPostActions] = useState(false);

  const postQuery = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostDetails(postId!),
    enabled: !!postId,
  });
  const commentsQuery = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getPostComments(postId!),
    enabled: !!postId,
  });

  const post = postQuery.data;
  const postMediaUrl = getMediaUrl(post?.image || post?.video) ?? mediaUrl;
  const isOwner = post?.userId._id === currentUserId;

  function refreshPost() {
    void queryClient.invalidateQueries({ queryKey: ["post", postId] });
    void queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    void queryClient.invalidateQueries({ queryKey: ["feed"] });
    void queryClient.invalidateQueries({ queryKey: ["explore"] });
    void queryClient.invalidateQueries({ queryKey: ["user-posts"] });
    void queryClient.invalidateQueries({ queryKey: ["user-profile"] });
  }

  const likeMutation = useMutation({
    mutationFn: () => (post?.isLiked ? unlikePost(postId!) : likePost(postId!)),
    retry: false,
    onSuccess: refreshPost,
  });
  const saveMutation = useMutation({
    mutationFn: () => (post?.isSaved ? unsavePost(postId!) : savePost(postId!)),
    retry: false,
    onSuccess: refreshPost,
  });
  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      replyTo ? createReply(postId!, replyTo._id, content) : createComment(postId!, content),
    retry: false,
    onSuccess: () => {
      setComment("");
      setReplyTo(null);
      refreshPost();
    },
  });
  const commentLikeMutation = useMutation({
    mutationFn: ({ item, liked }: { item: PostComment; liked: boolean }) =>
      liked ? unlikeComment(postId!, item._id) : likeComment(postId!, item._id),
    retry: false,
    onSuccess: refreshPost,
  });
  const editCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateComment(postId!, commentId, content),
    retry: false,
    onSuccess: refreshPost,
  });
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(postId!, commentId),
    retry: false,
    onSuccess: refreshPost,
  });
  const editPostMutation = useMutation({
    mutationFn: (caption: string) => updatePost(postId!, caption),
    retry: false,
    onSuccess: refreshPost,
  });
  const deletePostMutation = useMutation({
    mutationFn: () => deletePost(postId!),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["explore"] });
      void queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      void queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      close();
    },
  });

  function handleCommentChange(event: ChangeEvent<HTMLInputElement>) {
    setComment(event.target.value);
  }

  function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = comment.trim();
    if (!content || !postId || commentMutation.isPending) return;
    commentMutation.mutate(content);
  }

  function handleCommentLike(item: PostComment) {
    const liked = item.likedBy?.includes(currentUserId ?? "") ?? false;
    if (!commentLikeMutation.isPending) commentLikeMutation.mutate({ item, liked });
  }

  function handleEditComment(item: PostComment) {
    const content = window.prompt("Sửa bình luận", item.content)?.trim();
    if (content && content !== item.content) {
      editCommentMutation.mutate({ commentId: item._id, content });
    }
  }

  function handleDeleteComment(item: PostComment) {
    if (window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
      deleteCommentMutation.mutate(item._id);
    }
  }

  function handleEditPost() {
    const caption = window.prompt("Sửa chú thích", post?.caption ?? "")?.trim();
    if (caption !== undefined && caption !== post?.caption) editPostMutation.mutate(caption);
  }

  function handleDeletePost() {
    if (window.confirm("Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác.")) {
      deletePostMutation.mutate();
    }
  }

  function openAuthorProfile() {
    if (!post) return;
    close();
    navigate(`/user/${post.userId._id}`);
  }

  function renderComment(item: PostComment, isReply = false) {
    const ownComment = item.userId._id === currentUserId;
    const liked = item.likedBy?.includes(currentUserId ?? "") ?? false;
    return (
      <div key={item._id}>
        <div className="comment">
          <UserAvatar src={getMediaUrl(item.userId.profilePicture)} />
          <p>
            <strong>{item.userId.username}</strong> {item.content}
            <span>
              {new Date(item.createdAt).toLocaleDateString("vi-VN")}　
              {!isReply && <button onClick={() => setReplyTo(item)}>Trả lời</button>}
              {ownComment && (
                <>
                  　<button onClick={() => handleEditComment(item)}>Sửa</button>　
                  <button onClick={() => handleDeleteComment(item)}>Xóa</button>
                </>
              )}
            </span>
          </p>
          <button onClick={() => handleCommentLike(item)} disabled={commentLikeMutation.isPending}>
            <Icon name="heart" size={13} fill={liked} />
            {item.likes > 0 && <span>{item.likes}</span>}
          </button>
        </div>
        {item.replies?.map((reply) => renderComment(reply, true))}
      </div>
    );
  }

  return (
    <div className="modal-backdrop post-overlay">
      <button className="outside-close" onClick={close}>
        <Icon name="close" size={30} />
      </button>
      <section
        className="post-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết bài viết"
      >
        <div className="post-modal-image">
          {post?.mediaType === "video" ? (
            <video
              src={postMediaUrl}
              controls
              autoPlay={false}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <img src={postMediaUrl} alt="Chi tiết bài viết" />
          )}
        </div>
        <div className="post-details">
          <header>
            <UserAvatar src={getMediaUrl(post?.userId.profilePicture)} />
            <button onClick={openAuthorProfile}>
              <strong>{post?.userId.username ?? "Bài viết"}</strong>
            </button>
            <button
              onClick={() => isOwner && setShowPostActions(!showPostActions)}
              disabled={!isOwner}
            >
              <Icon name="more" />
            </button>
          </header>

          {showPostActions && isOwner && (
            <div className="recent-heading">
              <button
                className="text-action"
                onClick={handleEditPost}
                disabled={editPostMutation.isPending}
              >
                Sửa chú thích
              </button>
              <button
                className="text-action"
                onClick={handleDeletePost}
                disabled={deletePostMutation.isPending}
              >
                Xóa bài viết
              </button>
            </div>
          )}

          {(editPostMutation.isError || deletePostMutation.isError) && (
            <small className="field-error">Không thể cập nhật bài viết.</small>
          )}

          <div className="comments">
            {postId && (postQuery.isPending || commentsQuery.isPending) ? (
              <p>Đang tải bài viết...</p>
            ) : postId && (postQuery.isError || commentsQuery.isError) ? (
              <EmptyState icon="comment" title="Không thể tải bài viết" text="Vui lòng thử lại." />
            ) : postId ? (
              <>
                {post && (
                  <div className="comment">
                    <UserAvatar src={getMediaUrl(post.userId.profilePicture)} />
                    <p>
                      <strong>{post.userId.username}</strong> {post.caption}
                    </p>
                  </div>
                )}
                {commentsQuery.data?.comments.map((item) => renderComment(item))}
                {commentsQuery.data?.comments.length === 0 && <p>Chưa có bình luận nào.</p>}
              </>
            ) : (
              <p>Mở bài viết từ Home để xem bình luận thật.</p>
            )}
          </div>

          <div className="detail-actions">
            <div>
              <button
                className={post?.isLiked ? "liked" : ""}
                onClick={() => likeMutation.mutate()}
                disabled={post?.isLiked === undefined || likeMutation.isPending}
              >
                <Icon name="heart" fill={post?.isLiked === true} />
              </button>
              <Icon name="comment" />
              <Icon name="send" />
              <button
                onClick={() => saveMutation.mutate()}
                disabled={post?.isSaved === undefined || saveMutation.isPending}
              >
                <Icon name="bookmark" fill={post?.isSaved === true} />
              </button>
            </div>
            <strong>{post?.likes ?? 0} lượt thích</strong>
            <span>{post ? new Date(post.createdAt).toLocaleDateString("vi-VN") : ""}</span>
          </div>

          {replyTo && (
            <div className="recent-heading">
              <span>Đang trả lời @{replyTo.userId.username}</span>
              <button className="text-action" onClick={() => setReplyTo(null)}>
                Hủy
              </button>
            </div>
          )}
          {(commentMutation.isError ||
            editCommentMutation.isError ||
            deleteCommentMutation.isError ||
            commentLikeMutation.isError ||
            likeMutation.isError ||
            saveMutation.isError) && (
            <small className="field-error">Không thể cập nhật. Vui lòng thử lại.</small>
          )}
          <form onSubmit={handleAddComment}>
            <Icon name="smile" />
            <input
              placeholder={replyTo ? `Trả lời @${replyTo.userId.username}...` : "Thêm bình luận..."}
              value={comment}
              onChange={handleCommentChange}
            />
            <button disabled={!comment.trim() || commentMutation.isPending}>
              {commentMutation.isPending ? "Đang đăng" : "Đăng"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
