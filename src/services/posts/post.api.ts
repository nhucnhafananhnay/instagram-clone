import { authRequest } from "@/services/http/auth-request";
import type {
  CommentListData,
  PostComment,
  PostItem,
  PostListData,
  UserPostFilter,
} from "@/services/posts/post.types";

export async function getUserPosts(
  userId: string,
  filter: UserPostFilter,
  offset = 0,
  limit = 12,
): Promise<PostListData> {
  const response = await authRequest<PostListData>(
    `/api/posts/user/${userId}?filter=${filter}&limit=${limit}&offset=${offset}`,
    { method: "GET" },
  );
  return response.data;
}

export async function getFeed(offset = 0, limit = 10): Promise<PostListData> {
  const response = await authRequest<PostListData>(
    `/api/posts/feed?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
    },
  );
  return response.data;
}

export async function getExplore(page = 1, limit = 20): Promise<PostListData> {
  const offset = (page - 1) * limit;
  const response = await authRequest<PostListData>(
    `/api/posts/explore?page=${page}&limit=${limit}&offset=${offset}`,
    { method: "GET" },
  );
  return response.data;
}

export async function getPostDetails(postId: string): Promise<PostItem> {
  const response = await authRequest<PostItem>(`/api/posts/${postId}`, { method: "GET" });
  return response.data;
}

export async function getPostComments(postId: string): Promise<CommentListData> {
  const response = await authRequest<CommentListData>(
    `/api/posts/${postId}/comments?limit=50&offset=0`,
    { method: "GET" },
  );
  return response.data;
}

export async function likePost(postId: string): Promise<void> {
  await authRequest(`/api/posts/${postId}/like`, { method: "POST" });
}

export async function unlikePost(postId: string): Promise<void> {
  await authRequest(`/api/posts/${postId}/like`, { method: "DELETE" });
}

export async function savePost(postId: string): Promise<void> {
  await authRequest(`/api/posts/${postId}/save`, { method: "POST" });
}

export async function unsavePost(postId: string): Promise<void> {
  await authRequest(`/api/posts/${postId}/save`, { method: "DELETE" });
}

export async function createPost(file: File, caption: string): Promise<PostItem> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("caption", caption);

  const response = await authRequest<PostItem>("/api/posts", {
    method: "POST",
    body: formData,
  });
  return response.data;
}

export async function updatePost(postId: string, caption: string): Promise<PostItem> {
  const response = await authRequest<PostItem>(`/api/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify({ caption }),
  });
  return response.data;
}

export async function deletePost(postId: string): Promise<void> {
  await authRequest(`/api/posts/${postId}`, { method: "DELETE" });
}

export async function createComment(postId: string, content: string): Promise<PostComment> {
  const response = await authRequest<PostComment>(`/api/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content, parentCommentId: null }),
  });
  return response.data;
}

export async function createReply(
  postId: string,
  commentId: string,
  content: string,
): Promise<PostComment> {
  const response = await authRequest<PostComment>(
    `/api/posts/${postId}/comments/${commentId}/replies`,
    { method: "POST", body: JSON.stringify({ content }) },
  );
  return response.data;
}

export async function updateComment(
  postId: string,
  commentId: string,
  content: string,
): Promise<void> {
  await authRequest(`/api/posts/${postId}/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await authRequest(`/api/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
}

export async function likeComment(postId: string, commentId: string): Promise<void> {
  await authRequest(`/api/posts/${postId}/comments/${commentId}/like`, { method: "POST" });
}

export async function unlikeComment(postId: string, commentId: string): Promise<void> {
  await authRequest(`/api/posts/${postId}/comments/${commentId}/like`, { method: "DELETE" });
}
