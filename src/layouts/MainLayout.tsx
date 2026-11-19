import { Outlet, useLocation } from "react-router-dom";
import { MobileNavigation } from "@/components/navigation/MobileNavigation";
import { MoreMenu } from "@/components/navigation/MoreMenu";
import { NotificationsPanel } from "@/components/navigation/NotificationsPanel";
import { SearchPanel } from "@/components/navigation/SearchPanel";
import { Sidebar } from "@/components/navigation/Sidebar";
import { FloatingMessages } from "@/features/messages/FloatingMessages";
import { MessageSocketListener } from "@/features/messages/MessageSocketListener";
import { CreatePostModal } from "@/features/posts/CreatePostModal";
import { PostModal } from "@/features/posts/PostModal";
import { useUiStore } from "@/stores/use-ui-store";

export default function MainLayout() {
  const { pathname } = useLocation();
  const panel = useUiStore((state) => state.panel);
  const setPanel = useUiStore((state) => state.setPanel);
  const createPostOpen = useUiStore((state) => state.createPostOpen);
  const closeCreatePost = useUiStore((state) => state.closeCreatePost);
  const selectedPost = useUiStore((state) => state.selectedPost);
  const closePost = useUiStore((state) => state.closePost);
  const messagesOpen = useUiStore((state) => state.messagesOpen);
  const setMessagesOpen = useUiStore((state) => state.setMessagesOpen);
  const moreMenuOpen = useUiStore((state) => state.moreMenuOpen);
  const closeMoreMenu = useUiStore((state) => state.closeMoreMenu);

  function closePanel() {
    setPanel(null);
  }

  function closeMessages() {
    setMessagesOpen(false);
  }

  return (
    <div className="app-shell">
      <MessageSocketListener />
      <Sidebar />
      {panel === "search" && <SearchPanel close={closePanel} />}
      {panel === "notifications" && <NotificationsPanel close={closePanel} />}
      <div className={`page-content ${pathname === "/chat" ? "chat-route" : ""}`}>
        <Outlet />
      </div>
      <MobileNavigation />
      {createPostOpen && <CreatePostModal close={closeCreatePost} />}
      {selectedPost && (
        <PostModal postId={selectedPost.id} mediaUrl={selectedPost.mediaUrl} close={closePost} />
      )}
      {messagesOpen && <FloatingMessages close={closeMessages} />}
      {moreMenuOpen && <MoreMenu close={closeMoreMenu} />}
    </div>
  );
}
