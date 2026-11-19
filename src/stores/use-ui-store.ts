import { create } from "zustand";
import type { SelectedPost, SidePanel, UiOverlayState } from "@/types/index.type";

interface UiStore extends UiOverlayState {
  closeTransientUi: () => void;
  setPanel: (panel: SidePanel | null) => void;
  togglePanel: (panel: SidePanel) => void;
  openCreatePost: () => void;
  closeCreatePost: () => void;
  openPost: (post: string | SelectedPost) => void;
  closePost: () => void;
  setMessagesOpen: (open: boolean) => void;
  toggleMoreMenu: () => void;
  closeMoreMenu: () => void;
}

const initialOverlayState: UiOverlayState = {
  panel: null,
  createPostOpen: false,
  selectedPost: null,
  messagesOpen: false,
  moreMenuOpen: false,
};

export const useUiStore = create<UiStore>((set, get) => ({
  ...initialOverlayState,
  closeTransientUi: () => set({ panel: null, moreMenuOpen: false }),
  setPanel: (panel) => set({ panel }),
  togglePanel: (panel) => set({ panel: get().panel === panel ? null : panel }),
  openCreatePost: () => set({ createPostOpen: true }),
  closeCreatePost: () => set({ createPostOpen: false }),
  openPost: (post) => set({ selectedPost: typeof post === "string" ? { mediaUrl: post } : post }),
  closePost: () => set({ selectedPost: null }),
  setMessagesOpen: (messagesOpen) => set({ messagesOpen }),
  toggleMoreMenu: () => set({ moreMenuOpen: !get().moreMenuOpen }),
  closeMoreMenu: () => set({ moreMenuOpen: false }),
}));
