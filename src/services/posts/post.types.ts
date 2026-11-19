export interface PostUser {
  _id: string;
  username: string;
  fullName?: string;
  profilePicture?: string | null;
}

export interface PostItem {
  _id: string;
  caption: string;
  image: string | null;
  video: string | null;
  mediaType: "image" | "video";
  likes: number;
  comments: number | PostComment[];
  totalComments?: number;
  createdAt: string;
  userId: PostUser;
  isLiked?: boolean;
  isSaved?: boolean;
  engagementScore?: number;
}

export interface PostListData {
  posts: PostItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export type UserPostFilter = "all" | "video" | "saved";

export interface PostComment {
  _id: string;
  postId: string;
  userId: PostUser;
  parentCommentId: string | null;
  content: string;
  likes: number;
  likedBy?: string[];
  createdAt: string;
  replies?: PostComment[];
}

export interface CommentListData {
  comments: PostComment[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
