interface UserAvatarProps {
  src?: string;
  name?: string;
  size?: number;
}

export function UserAvatar({ src, name = "T", size = 36 }: UserAvatarProps) {
  return (
    <div className="avatar" style={{ width: size, height: size }}>
      {src ? <img src={src} alt="" /> : name.slice(0, 1).toUpperCase()}
    </div>
  );
}
