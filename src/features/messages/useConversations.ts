import { useInfiniteQuery } from "@tanstack/react-query";
import { getConversations } from "@/services/messages/message.api";

export function useConversations() {
  const query = useInfiniteQuery({
    queryKey: ["conversations"],
    queryFn: ({ pageParam }) => getConversations(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.currentPage + 1 : undefined,
    retry: false,
  });

  const allConversations = query.data?.pages.flatMap((page) => page.conversations) ?? [];
  const conversations = [
    ...new Map(allConversations.map((conversation) => [conversation._id, conversation])).values(),
  ];

  return { query, conversations };
}
