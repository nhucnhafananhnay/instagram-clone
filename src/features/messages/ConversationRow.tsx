import { UserAvatar } from "@/components/ui";
import { getMediaUrl } from "@/services/http/media-url";
import type { Conversation, MessageUser } from "@/services/messages/message.types";

interface ConversationRowProps {
  conversation: Conversation;
  currentUserId?: string;
  selected?: boolean;
  onClick: () => void;
}

export function getChatPartner(
  conversation: Conversation,
  currentUserId?: string,
): MessageUser | undefined {
  return conversation.participants.find((user) => user._id !== currentUserId);
}

export function ConversationRow({
  conversation,
  currentUserId,
  selected,
  onClick,
}: ConversationRowProps) {
  const partner = getChatPartner(conversation, currentUserId);
  const lastMessage = conversation.lastMessage;
  const preview = lastMessage
    ? lastMessage.messageType === "image"
      ? "Đã gửi một ảnh"
      : lastMessage.content
    : "Bắt đầu cuộc trò chuyện";
  const time = new Date(conversation.lastMessageAt).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <button
      className={`conversation ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <UserAvatar
        src={getMediaUrl(partner?.profilePicture)}
        name={partner?.fullName || partner?.username}
        size={50}
      />
      <div>
        <strong>{partner?.username ?? "Người dùng"}</strong>
        <span>
          {preview} · {time}
          {!!conversation.unreadCount && ` · ${conversation.unreadCount} tin chưa đọc`}
        </span>
      </div>
    </button>
  );
}
