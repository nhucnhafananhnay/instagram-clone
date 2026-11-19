import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { EmptyState, Icon, UserAvatar } from "@/components/ui";
import { ConversationRow, getChatPartner } from "@/features/messages/ConversationRow";
import { NewMessageModal } from "@/features/messages/NewMessageModal";
import { useConversations } from "@/features/messages/useConversations";
import { getMediaUrl } from "@/services/http/media-url";
import {
  getConversationMessages,
  markMessageRead,
  sendImageMessage,
  sendTextMessage,
} from "@/services/messages/message.api";
import { connectSocket } from "@/services/socket/socket.config";
import { useAuthStore } from "@/stores/use-auth-store";

export default function ChatPage() {
  const currentUser = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.session?.accessToken);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [newChat, setNewChat] = useState(false);
  const [message, setMessage] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [typing, setTyping] = useState(false);
  const [imageError, setImageError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<number | undefined>(undefined);
  const loadingOlderRef = useRef(false);
  const markedMessagesRef = useRef(new Set<string>());
  const { query: conversationsQuery, conversations } = useConversations();
  const activeId = searchParams.get("conversation");
  const activeConversation = conversations.find((item) => item._id === activeId);
  const partner = activeConversation
    ? getChatPartner(activeConversation, currentUser?._id)
    : undefined;

  const messagesQuery = useInfiniteQuery({
    queryKey: ["messages", activeId],
    queryFn: ({ pageParam }) => getConversationMessages(activeId!, pageParam),
    enabled: !!activeId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.currentPage + 1 : undefined,
    retry: false,
  });

  const allMessages = messagesQuery.data?.pages.flatMap((page) => page.messages) ?? [];
  const messages = [
    ...new Map(allMessages.map((item) => [item._id, item])).values(),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  function refreshMessages() {
    void queryClient.invalidateQueries({ queryKey: ["messages", activeId] });
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    void queryClient.invalidateQueries({ queryKey: ["unread-count"] });
  }

  const textMutation = useMutation({
    mutationFn: (content: string) => sendTextMessage(activeId!, partner!._id, content),
    retry: false,
    onSuccess: () => {
      setMessage("");
      refreshMessages();
    },
  });

  const imageMutation = useMutation({
    mutationFn: (file: File) => sendImageMessage(activeId!, partner!._id, file),
    retry: false,
    onSuccess: refreshMessages,
  });

  useEffect(() => {
    if (loadingOlderRef.current) {
      loadingOlderRef.current = false;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const unreadMessages = messages.filter(
      (item) =>
        item.senderId._id !== currentUser?._id &&
        !item.isRead &&
        !markedMessagesRef.current.has(item._id),
    );
    if (unreadMessages.length === 0) return;

    unreadMessages.forEach((item) => markedMessagesRef.current.add(item._id));
    void Promise.all(unreadMessages.map((item) => markMessageRead(item._id))).then(() => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      void queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    });
  }, [currentUser?._id, messages, queryClient]);

  useEffect(() => {
    if (!accessToken || !activeId || !partner) return;
    const socket = connectSocket(accessToken);

    const handleTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeId && data.userId === partner._id) setTyping(true);
    };
    const handleStopTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeId && data.userId === partner._id) setTyping(false);
    };

    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);
    return () => {
      socket.emit("stop_typing", { conversationId: activeId, recipientId: partner._id });
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
      window.clearTimeout(typingTimerRef.current);
    };
  }, [accessToken, activeId, partner]);

  function selectConversation(conversationId: string) {
    markedMessagesRef.current.clear();
    setSearchParams({ conversation: conversationId });
  }

  function handleMessageChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setMessage(value);
    if (!accessToken || !activeId || !partner) return;

    const socket = connectSocket(accessToken);
    if (!value.trim()) {
      window.clearTimeout(typingTimerRef.current);
      socket.emit("stop_typing", { conversationId: activeId, recipientId: partner._id });
      return;
    }
    socket.emit("typing", { conversationId: activeId, recipientId: partner._id });
    window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      socket.emit("stop_typing", { conversationId: activeId, recipientId: partner._id });
    }, 900);
  }

  function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = message.trim();
    if (!content || !partner || textMutation.isPending) return;

    if (accessToken && activeId) {
      connectSocket(accessToken).emit("stop_typing", {
        conversationId: activeId,
        recipientId: partner._id,
      });
    }
    textMutation.mutate(content);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !partner || imageMutation.isPending) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Vui lòng chọn một tệp hình ảnh.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError("Ảnh không được lớn hơn 10MB.");
      return;
    }

    setImageError("");
    imageMutation.mutate(file);
  }

  function loadOlderMessages() {
    loadingOlderRef.current = true;
    void messagesQuery.fetchNextPage();
  }

  const normalizedSearch = conversationSearch.trim().toLowerCase();
  const filteredConversations = conversations.filter((conversation) => {
    const user = getChatPartner(conversation, currentUser?._id);
    return `${user?.username ?? ""} ${user?.fullName ?? ""}`
      .toLowerCase()
      .includes(normalizedSearch);
  });

  return (
    <main className="chat-page">
      <section className="conversation-list">
        <header>
          <strong>{currentUser?.username}</strong>
          <button onClick={() => setNewChat(true)}>
            <Icon name="edit" size={20} />
          </button>
        </header>
        <div className="search-box">
          <Icon name="search" size={16} />
          <input
            placeholder="Tìm kiếm"
            value={conversationSearch}
            onChange={(event) => setConversationSearch(event.target.value)}
          />
        </div>
        <h3>Tin nhắn</h3>
        {conversationsQuery.isPending && <p>Đang tải hội thoại...</p>}
        {conversationsQuery.isError && <p className="auth-error">Không thể tải hội thoại.</p>}
        {filteredConversations.map((conversation) => (
          <ConversationRow
            key={conversation._id}
            conversation={conversation}
            currentUserId={currentUser?._id}
            selected={conversation._id === activeId}
            onClick={() => selectConversation(conversation._id)}
          />
        ))}
        {conversationsQuery.isSuccess && filteredConversations.length === 0 && (
          <p>Chưa có cuộc trò chuyện nào.</p>
        )}
        {conversationsQuery.hasNextPage && (
          <button className="text-action" onClick={() => conversationsQuery.fetchNextPage()}>
            {conversationsQuery.isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
          </button>
        )}
      </section>

      <section className="chat-content">
        {activeConversation && partner ? (
          <>
            <header className="chat-header">
              <UserAvatar
                src={getMediaUrl(partner.profilePicture)}
                name={partner.fullName || partner.username}
              />
              <strong>{partner.username}</strong>
              <Icon name="user" />
            </header>
            <div className="messages">
              <UserAvatar
                src={getMediaUrl(partner.profilePicture)}
                name={partner.fullName || partner.username}
                size={76}
              />
              <h3>{partner.username}</h3>
              <p>Bạn đang trò chuyện với {partner.username}</p>

              {messagesQuery.hasNextPage && (
                <button
                  className="text-action"
                  onClick={loadOlderMessages}
                  disabled={messagesQuery.isFetchingNextPage}
                >
                  {messagesQuery.isFetchingNextPage ? "Đang tải..." : "Xem tin nhắn cũ"}
                </button>
              )}
              {messagesQuery.isPending && <p>Đang tải tin nhắn...</p>}
              {messagesQuery.isError && <p className="auth-error">Không thể tải tin nhắn.</p>}
              {messagesQuery.isSuccess && messages.length === 0 && <p>Chưa có tin nhắn nào.</p>}
              {messages.map((item) => {
                const mine = item.senderId._id === currentUser?._id;
                const bubble = (
                  <div className={`bubble ${mine ? "mine" : ""}`}>
                    {item.messageType === "image" ? (
                      <img
                        src={getMediaUrl(item.imageUrl)}
                        alt="Ảnh trong tin nhắn"
                        style={{ maxWidth: 240, borderRadius: 10 }}
                      />
                    ) : (
                      item.content
                    )}
                    <small>{new Date(item.createdAt).toLocaleTimeString("vi-VN")}</small>
                  </div>
                );

                return mine ? (
                  <div key={item._id} className="bubble mine">
                    {item.messageType === "image" ? (
                      <img
                        src={getMediaUrl(item.imageUrl)}
                        alt="Ảnh trong tin nhắn"
                        style={{ maxWidth: 240, borderRadius: 10 }}
                      />
                    ) : (
                      item.content
                    )}
                    <small>{new Date(item.createdAt).toLocaleTimeString("vi-VN")}</small>
                  </div>
                ) : (
                  <div className="user-row" key={item._id} style={{ alignSelf: "flex-start" }}>
                    <UserAvatar
                      src={getMediaUrl(item.senderId.profilePicture)}
                      name={item.senderId.fullName || item.senderId.username}
                      size={28}
                    />
                    {bubble}
                  </div>
                );
              })}
              {typing && <div className="bubble">Đang nhập...</div>}
              <div ref={messagesEndRef} />
            </div>
            <form className="message-input" onSubmit={handleSendMessage}>
              <Icon name="smile" />
              <input
                placeholder="Nhắn tin..."
                value={message}
                onChange={handleMessageChange}
                disabled={textMutation.isPending}
              />
              <label>
                <Icon name="image" />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                  disabled={imageMutation.isPending}
                />
              </label>
              <button disabled={!message.trim() || textMutation.isPending}>
                <Icon name="heart" />
              </button>
            </form>
            {(textMutation.isError || imageMutation.isError) && (
              <p className="auth-error">Không thể gửi tin nhắn. Vui lòng thử lại.</p>
            )}
            {imageError && <p className="auth-error">{imageError}</p>}
          </>
        ) : (
          <EmptyState
            icon="message"
            title="Tin nhắn của bạn"
            text="Gửi ảnh và tin nhắn riêng tư cho bạn bè hoặc nhóm."
            action="Gửi tin nhắn"
            onAction={() => setNewChat(true)}
          />
        )}
      </section>

      {newChat && (
        <NewMessageModal
          close={() => setNewChat(false)}
          onCreated={(conversation) => {
            selectConversation(conversation._id);
            setNewChat(false);
          }}
        />
      )}
    </main>
  );
}
