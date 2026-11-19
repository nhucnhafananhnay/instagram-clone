import { useEffect, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, UserAvatar } from "@/components/ui";
import { getMediaUrl } from "@/services/http/media-url";
import { createConversation } from "@/services/messages/message.api";
import type { Conversation } from "@/services/messages/message.types";
import { searchUsers } from "@/services/users/user.api";
import { useAuthStore } from "@/stores/use-auth-store";

interface NewMessageModalProps {
  close: () => void;
  onCreated: (conversation: Conversation) => void;
}

export function NewMessageModal({ close, onCreated }: NewMessageModalProps) {
  const currentUserId = useAuthStore((state) => state.user?._id);
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setKeyword(query.trim()), 300);
    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const usersQuery = useQuery({
    queryKey: ["user-search", keyword],
    queryFn: () => searchUsers(keyword),
    enabled: !!keyword,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: createConversation,
    retry: false,
    onSuccess: (conversation) => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      onCreated(conversation);
    },
  });

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setSelectedUserId("");
  }

  return (
    <Modal title="Tin nhắn mới" close={close}>
      <div className="new-message">
        <label>Đến:</label>
        <input autoFocus placeholder="Tìm kiếm..." value={query} onChange={handleSearch} />
        {query.trim() && keyword !== query.trim() && <p>Đang tìm kiếm...</p>}
        {usersQuery.isPending && keyword && <p>Đang tìm kiếm...</p>}
        {usersQuery.isError && <p className="auth-error">Không thể tìm kiếm người dùng.</p>}
        {usersQuery.data
          ?.filter((user) => user._id !== currentUserId)
          .map((user) => (
            <button key={user._id} onClick={() => setSelectedUserId(user._id)}>
              <span className="user-row">
                <UserAvatar
                  src={getMediaUrl(user.profilePicture)}
                  name={user.fullName || user.username}
                  size={44}
                />
                <span className="user-copy">
                  <strong>{user.username}</strong>
                  <span>{user.fullName}</span>
                </span>
              </span>
              <span className="radio">{selectedUserId === user._id ? "●" : ""}</span>
            </button>
          ))}
        {usersQuery.isSuccess && keyword && usersQuery.data.length === 0 && (
          <p>Không tìm thấy người dùng.</p>
        )}
        {createMutation.isError && (
          <p className="auth-error">Không thể mở cuộc trò chuyện.</p>
        )}
        <Button
          onClick={() => createMutation.mutate(selectedUserId)}
          disabled={!selectedUserId || createMutation.isPending}
        >
          {createMutation.isPending ? "Đang mở..." : "Chat"}
        </Button>
      </div>
    </Modal>
  );
}
