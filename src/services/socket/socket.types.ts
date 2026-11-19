import type { MessageItem } from "@/services/messages/message.types";

export interface TypingEvent {
  conversationId: string;
  userId: string;
}

export interface TypingPayload {
  conversationId: string;
  recipientId: string;
}

export interface SocketServerEvents {
  new_message: (message: MessageItem) => void;
  user_typing: (data: TypingEvent) => void;
  user_stop_typing: (data: TypingEvent) => void;
}

export interface SocketClientEvents {
  typing: (data: TypingPayload) => void;
  stop_typing: (data: TypingPayload) => void;
}
