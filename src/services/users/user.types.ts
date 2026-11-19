export interface SuggestedUser {
  _id: string;
  username: string;
  fullName: string;
  profilePicture: string | null;
  bio?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing: boolean;
}

export interface SearchUser {
  _id: string;
  username: string;
  fullName: string;
  profilePicture: string | null;
}

export interface SearchHistoryItem {
  _id: string;
  searchQuery: string;
  searchedUserId: SearchUser | null;
  createdAt: string;
}

export interface AddSearchHistoryRequest {
  searchedUserId: string;
  searchQuery: string;
}

export interface UserProfile extends SearchUser {
  email?: string;
  bio: string | null;
  website: string | null;
  gender: "male" | "female" | "other" | null;
  followersCount: number;
  followingCount: number;
  postsCount?: number;
  isFollowing: boolean;
}

export interface FollowUser extends SearchUser {
  bio: string | null;
}

export interface FollowPagination {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export interface FollowersData {
  followers: FollowUser[];
  pagination: FollowPagination & { totalFollowers: number };
}

export interface FollowingData {
  following: FollowUser[];
  pagination: FollowPagination & { totalFollowing: number };
}

export interface EditProfileRequest {
  fullName: string;
  bio: string;
  website: string;
  gender: "male" | "female" | "other";
  profilePicture?: File;
}
