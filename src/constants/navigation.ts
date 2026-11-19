import type { IconName, SidePanel } from "@/types/index.type";

export type NavigationItem = {
  name: IconName;
  label: string;
  route?: string;
  action?: SidePanel | "create";
};

export const navigationItems: NavigationItem[] = [
  { name: "home", label: "Trang chủ", route: "/" },
  { name: "search", label: "Tìm kiếm", action: "search" },
  { name: "compass", label: "Khám phá", route: "/explore" },
  { name: "message", label: "Tin nhắn", route: "/chat" },
  { name: "heart", label: "Thông báo", action: "notifications" },
  { name: "plus", label: "Tạo", action: "create" },
  { name: "user", label: "Trang cá nhân", route: "/user/me" },
];
