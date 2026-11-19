export type IconName =
  | "home"
  | "search"
  | "compass"
  | "message"
  | "heart"
  | "plus"
  | "user"
  | "menu"
  | "more"
  | "send"
  | "comment"
  | "bookmark"
  | "grid"
  | "film"
  | "edit"
  | "close"
  | "image"
  | "smile"
  | "back"
  | "lock"
  | "facebook";

export interface User {
  user: string;
  name: string;
  img?: string;
}

export interface Post {
  id: string;
  image: string;
  user: string;
  caption: string;
}

export type AuthMode = "login" | "register" | "forgot";
export type ProfileTab = "posts" | "saved" | "videos";
export type SidePanel = "search" | "notifications";

export interface SelectedPost {
  id?: string;
  mediaUrl: string;
}

export type UiOverlayState = {
  panel: SidePanel | null;
  createPostOpen: boolean;
  selectedPost: SelectedPost | null;
  messagesOpen: boolean;
  moreMenuOpen: boolean;
};
