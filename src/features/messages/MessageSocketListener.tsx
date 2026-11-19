import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket, disconnectSocket } from "@/services/socket/socket.config";
import { useAuthStore } from "@/stores/use-auth-store";

export function MessageSocketListener() {
  const accessToken = useAuthStore((state) => state.session?.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(accessToken);
    const handleNewMessage = (message: { conversationId: string }) => {
      void queryClient.invalidateQueries({ queryKey: ["messages", message.conversationId] });
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      void queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
      disconnectSocket();
    };
  }, [accessToken, queryClient]);

  return null;
}
