import { UserAvatar } from "@/components/ui";
import { users } from "@/constants/mock-data";

export function Stories() {
  return (
    <div className="stories">
      {users.slice(0, 5).map((user, index) => (
        <button key={user.user} disabled title="Backend chưa có API Stories">
          <div className="story-ring">
            <UserAvatar src={user.img} size={54} />
          </div>
          <span>{index === 0 ? "Tin của bạn" : user.user}</span>
        </button>
      ))}
    </div>
  );
}
