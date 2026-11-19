import { authRequest } from "@/services/http/auth-request";
import type {
  Conversation,
  ConversationsData,
  MessageItem,
  MessagesData,
  UnreadCountData,
} from "@/services/messages/message.types";

export async function getConversations(page = 1): Promise<ConversationsData> {
  const response = await authRequest<ConversationsData>(
    `/api/messages/conversations?page=${page}&limit=20`,
    { method: "GET" },
  );
  return response.data;
}

export async function createConversation(userId: string): Promise<Conversation> {
  const response = await authRequest<Conversation>("/api/messages/conversations", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
  return response.data;
}

export async function getConversationMessages(
  conversationId: string,
  page = 1,
): Promise<MessagesData> {
  const response = await authRequest<MessagesData>(
    `/api/messages/conversations/${conversationId}/messages?page=${page}&limit=50`,
    { method: "GET" },
  );
  return response.data;
}

export async function sendTextMessage(
  conversationId: string,
  recipientId: string,
  content: string,
): Promise<MessageItem> {
  const response = await authRequest<MessageItem>("/api/messages/messages", {
    method: "POST",
    body: JSON.stringify({ conversationId, recipientId, messageType: "text", content }),
  });
  return response.data;
}

export async function sendImageMessage(
  conversationId: string,
  recipientId: string,
  image: File,
): Promise<MessageItem> {
  const formData = new FormData();
  formData.append("conversationId", conversationId);
  formData.append("recipientId", recipientId);
  formData.append("messageType", "image");
  formData.append("image", image);

  const response = await authRequest<MessageItem>("/api/messages/messages", {
    method: "POST",
    body: formData,
  });
  return response.data;
}

export async function markMessageRead(messageId: string): Promise<void> {
  await authRequest(`/api/messages/messages/${messageId}/read`, { method: "PUT" });
}

export async function getUnreadCount(): Promise<number> {
  const response = await authRequest<UnreadCountData>("/api/messages/unread-count", {
    method: "GET",
  });
  return response.data.unreadCount;
}
