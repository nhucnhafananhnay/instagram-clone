import { UserAvatar } from "@/components/ui";
import type { User } from "@/types/index.type";

interface UserRowProps {
  user: Pick<User, "user" | "name" | "img">;
  suggestion?: boolean;
}

export function UserRow({ user, suggestion = false }: UserRowProps) {
  return (
    <div className="user-row">
      <UserAvatar src={user.img} size={suggestion ? 34 : 44} />
      <div className="user-copy">
        <strong>{user.user}</strong>
        <span>{suggestion ? "Gợi ý cho bạn" : user.name}</span>
      </div>
      {suggestion && (
        <button
          className="text-action"
          disabled
          title="Thông báo hiện là nội dung minh họa"
        >
          Theo dõi
        </button>
      )}
    </div>
  );
}
