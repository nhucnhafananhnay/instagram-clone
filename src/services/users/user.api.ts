import { authRequest } from "@/services/http/auth-request";
import { apiRequest } from "@/services/http/http-client";
import type {
  AddSearchHistoryRequest,
  EditProfileRequest,
  FollowersData,
  FollowingData,
  SearchHistoryItem,
  SearchUser,
  SuggestedUser,
  UserProfile,
} from "@/services/users/user.types";

export async function getMyProfile(): Promise<UserProfile> {
  const response = await authRequest<UserProfile>("/api/users/profile", { method: "GET" });
  return response.data;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const response = await authRequest<UserProfile>(`/api/users/${userId}`, { method: "GET" });
  return response.data;
}

export async function updateProfile(
  data: Partial<EditProfileRequest>,
): Promise<UserProfile> {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, value);
  });

  const response = await authRequest<UserProfile>("/api/users/profile", {
    method: "PATCH",
    body: formData,
  });
  return response.data;
}

export async function deleteProfilePicture(): Promise<void> {
  await authRequest("/api/users/profile/picture", { method: "DELETE" });
}

export async function getFollowers(userId: string, page = 1): Promise<FollowersData> {
  const response = await authRequest<FollowersData>(
    `/api/follow/${userId}/followers?page=${page}&limit=20`,
    { method: "GET" },
  );
  return response.data;
}

export async function getFollowing(userId: string, page = 1): Promise<FollowingData> {
  const response = await authRequest<FollowingData>(
    `/api/follow/${userId}/following?page=${page}&limit=20`,
    { method: "GET" },
  );
  return response.data;
}

export async function searchUsers(keyword: string): Promise<SearchUser[]> {
  const response = await apiRequest<SearchUser[]>(
    `/api/users/search?q=${encodeURIComponent(keyword)}`,
    { method: "GET" },
  );
  return response.data;
}

export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  const response = await authRequest<SearchHistoryItem[]>("/api/search-history", {
    method: "GET",
  });
  return response.data;
}

export async function addSearchHistory(
  history: AddSearchHistoryRequest,
): Promise<SearchHistoryItem> {
  const response = await authRequest<SearchHistoryItem>("/api/search-history", {
    method: "POST",
    body: JSON.stringify(history),
  });
  return response.data;
}

export async function deleteSearchHistory(historyId: string): Promise<void> {
  await authRequest(`/api/search-history/${historyId}`, { method: "DELETE" });
}

export async function clearSearchHistory(): Promise<void> {
  await authRequest("/api/search-history", { method: "DELETE" });
}

export async function getSuggestedUsers(limit = 5): Promise<SuggestedUser[]> {
  const response = await authRequest<SuggestedUser[]>(`/api/users/suggested?limit=${limit}`, {
    method: "GET",
  });
  return response.data;
}

export async function followUser(userId: string): Promise<void> {
  await authRequest(`/api/follow/${userId}/follow`, { method: "POST" });
}

export async function unfollowUser(userId: string): Promise<void> {
  await authRequest(`/api/follow/${userId}/follow`, { method: "DELETE" });
}
