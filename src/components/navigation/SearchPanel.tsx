import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { EmptyState, Icon, UserAvatar } from "@/components/ui";
import { getMediaUrl } from "@/services/http/media-url";
import {
  addSearchHistory,
  clearSearchHistory,
  deleteSearchHistory,
  getSearchHistory,
  searchUsers,
} from "@/services/users/user.api";

interface SearchPanelProps {
  close: () => void;
}

export function SearchPanel({ close }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  const searchQuery = useQuery({
    queryKey: ["user-search", keyword],
    queryFn: () => searchUsers(keyword),
    enabled: keyword.length > 0,
    retry: false,
  });

  const historyQuery = useQuery({
    queryKey: ["search-history"],
    queryFn: getSearchHistory,
    enabled: !hasQuery,
    retry: false,
  });

  const addHistoryMutation = useMutation({
    mutationFn: addSearchHistory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["search-history"] }),
  });

  const deleteHistoryMutation = useMutation({
    mutationFn: deleteSearchHistory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["search-history"] }),
  });

  const clearHistoryMutation = useMutation({
    mutationFn: clearSearchHistory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["search-history"] }),
  });

  const isChangingHistory =
    addHistoryMutation.isPending ||
    deleteHistoryMutation.isPending ||
    clearHistoryMutation.isPending;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setKeyword(trimmedQuery), 300);
    return () => window.clearTimeout(timeoutId);
  }, [trimmedQuery]);

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    addHistoryMutation.reset();
  }

  function clearSearch() {
    setQuery("");
    setKeyword("");
    addHistoryMutation.reset();
  }

  function openProfile(userId: string) {
    close();
    navigate(`/user/${userId}`);
  }

  function handleSearchResult(userId: string) {
    if (isChangingHistory) return;

    addHistoryMutation.mutate(
      { searchedUserId: userId, searchQuery: trimmedQuery },
      { onSuccess: () => openProfile(userId) },
    );
  }

  return (
    <section className="slide-panel">
      <header>
        <h2>Tìm kiếm</h2>
        <button onClick={close}>
          <Icon name="close" size={18} />
        </button>
      </header>
      <div className="search-box">
        <Icon name="search" size={17} />
        <input ref={inputRef} placeholder="Tìm kiếm" value={query} onChange={handleSearch} />
        {query && (
          <button onClick={clearSearch}>
            <Icon name="close" size={14} />
          </button>
        )}
      </div>
      <div className="panel-divider" />
      <div className="recent-heading">
        <strong>{hasQuery ? "Kết quả tìm kiếm" : "Mới đây"}</strong>
        {!hasQuery && (
          <button
            className="text-action"
            onClick={() => clearHistoryMutation.mutate()}
            disabled={isChangingHistory || !historyQuery.data?.length}
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {hasQuery && (keyword !== trimmedQuery || searchQuery.isPending) && (
        <p className="copyright">Đang tìm kiếm...</p>
      )}
      {hasQuery && searchQuery.isError && (
        <p className="auth-error" role="alert">
          Không thể tìm kiếm người dùng. Vui lòng thử lại.
        </p>
      )}
      {hasQuery && addHistoryMutation.isError && (
        <p className="auth-error" role="alert">
          Không thể lưu lịch sử tìm kiếm. Vui lòng thử lại.
        </p>
      )}
      {hasQuery &&
        keyword === trimmedQuery &&
        searchQuery.data?.map((user) => (
          <div className="search-result" key={user._id}>
            <button
              className="user-row"
              onClick={() => handleSearchResult(user._id)}
              disabled={isChangingHistory}
            >
              <UserAvatar
                src={getMediaUrl(user.profilePicture)}
                name={user.fullName || user.username}
                size={44}
              />
              <span className="user-copy">
                <strong>{user.username}</strong>
                <span>{user.fullName}</span>
              </span>
            </button>
          </div>
        ))}
      {hasQuery &&
        keyword === trimmedQuery &&
        searchQuery.isSuccess &&
        searchQuery.data.length === 0 && (
          <EmptyState
            icon="search"
            title="Không tìm thấy kết quả"
            text="Hãy thử tìm một từ khóa khác."
          />
        )}

      {!hasQuery && historyQuery.isPending && <p className="copyright">Đang tải lịch sử...</p>}
      {!hasQuery && historyQuery.isError && (
        <p className="auth-error" role="alert">
          Không thể tải lịch sử tìm kiếm. Vui lòng thử lại.
        </p>
      )}
      {!hasQuery && (deleteHistoryMutation.isError || clearHistoryMutation.isError) && (
        <p className="auth-error" role="alert">
          Không thể xóa lịch sử tìm kiếm. Vui lòng thử lại.
        </p>
      )}
      {!hasQuery &&
        historyQuery.data?.map((history) => {
          const user = history.searchedUserId;
          if (!user) return null;

          return (
            <div className="search-result" key={history._id}>
              <button
                className="user-row"
                onClick={() => openProfile(user._id)}
                disabled={isChangingHistory}
              >
                <UserAvatar
                  src={getMediaUrl(user.profilePicture)}
                  name={user.fullName || user.username}
                  size={44}
                />
                <span className="user-copy">
                  <strong>{user.username}</strong>
                  <span>{user.fullName}</span>
                </span>
              </button>
              <button
                onClick={() => deleteHistoryMutation.mutate(history._id)}
                disabled={isChangingHistory}
                aria-label={`Xóa ${user.username} khỏi lịch sử`}
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          );
        })}
      {!hasQuery && historyQuery.isSuccess && historyQuery.data.length === 0 && (
        <EmptyState
          icon="search"
          title="Chưa có lịch sử tìm kiếm"
          text="Những tài khoản bạn tìm kiếm sẽ xuất hiện tại đây."
        />
      )}
    </section>
  );
}
