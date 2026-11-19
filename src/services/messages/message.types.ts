export interface MessageUser {
  _id: string;
  username: string;
  fullName: string;
  profilePicture: string | null;
}

export interface MessageItem {
  _id: string;
  conversationId: string;
  senderId: MessageUser;
  recipientId: string;
  messageType: "text" | "image";
  content?: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: MessageUser[];
  lastMessage: {
    _id: string;
    messageType: "text" | "image";
    content?: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  } | null;
  lastMessageAt: string;
  unreadCount?: number;
  createdAt: string;
}

export interface PageInfo {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ConversationsData {
  conversations: Conversation[];
  pagination: PageInfo & { totalConversations: number };
}

export interface MessagesData {
  messages: MessageItem[];
  pagination: PageInfo & { totalMessages: number };
}

export interface UnreadCountData {
  unreadCount: number;
}
