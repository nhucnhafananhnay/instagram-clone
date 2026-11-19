import { Icon, UserAvatar } from "@/components/ui";
import { photos, users } from "@/constants/mock-data";
import { UserRow } from "@/features/users/UserRow";

interface NotificationsPanelProps {
  close: () => void;
}

export function NotificationsPanel({ close }: NotificationsPanelProps) {
  return (
    <section className="slide-panel notifications">
      <header>
        <h2>Thông báo</h2>
        <button onClick={close}>
          <Icon name="close" size={18} />
        </button>
      </header>
      <h3>Hôm nay</h3>
      <UserRow user={users[0]} suggestion />
      <div className="notification-row">
        <UserAvatar src={users[1].img} />
        <p>
          <strong>ChibiChamp</strong> đã thích ảnh của bạn. <span>2 giờ</span>
        </p>
        <img src={photos[3]} alt="" />
      </div>
      <h3>Tuần này</h3>
      <div className="notification-row">
        <UserAvatar src={users[2].img} />
        <p>
          <strong>Thanhdora</strong> đã bình luận: “Ảnh đẹp quá!” <span>3 ngày</span>
        </p>
        <img src={photos[5]} alt="" />
      </div>
      <UserRow user={users[3]} suggestion />
    </section>
  );
}
