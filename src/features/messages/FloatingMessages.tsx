import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState, Icon } from "@/components/ui";
import { ConversationRow } from "@/features/messages/ConversationRow";
import { NewMessageModal } from "@/features/messages/NewMessageModal";
import { useConversations } from "@/features/messages/useConversations";
import { useAuthStore } from "@/stores/use-auth-store";

export function FloatingMessages({ close }: { close: () => void }) {
  const navigate = useNavigate();
  const currentUserId = useAuthStore((state) => state.user?._id);
  const [newChat, setNewChat] = useState(false);
  const { query, conversations } = useConversations();

  function openConversation(conversationId: string) {
    close();
    navigate(`/chat?conversation=${conversationId}`);
  }

  return (
    <>
      <section className="floating-panel">
        <header>
          <strong>Tin nhắn</strong>
          <span>
            <button onClick={() => setNewChat(true)}>
              <Icon name="edit" size={18} />
            </button>
            <button onClick={close}>
              <Icon name="close" size={18} />
            </button>
          </span>
        </header>
        <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
          {query.isPending && <p className="copyright">Đang tải hội thoại...</p>}
          {query.isError && <p className="auth-error">Không thể tải hội thoại.</p>}
          {conversations.map((conversation) => (
            <ConversationRow
              key={conversation._id}
              conversation={conversation}
              currentUserId={currentUserId}
              onClick={() => openConversation(conversation._id)}
            />
          ))}
          {query.isSuccess && conversations.length === 0 && (
            <EmptyState
              icon="image"
              title="Chưa có tin nhắn nào"
              text="Hãy bắt đầu trò chuyện với ai đó"
              action="Tin nhắn mới"
              onAction={() => setNewChat(true)}
            />
          )}
          {query.hasNextPage && (
            <button className="text-action" onClick={() => query.fetchNextPage()}>
              {query.isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
            </button>
          )}
        </div>
      </section>
      {newChat && (
        <NewMessageModal
          close={() => setNewChat(false)}
          onCreated={(conversation) => {
            setNewChat(false);
            openConversation(conversation._id);
          }}
        />
      )}
    </>
  );
}
