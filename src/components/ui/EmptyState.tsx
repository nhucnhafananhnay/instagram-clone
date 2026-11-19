import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/types/index.type";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  text: string;
  action?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, text, action, onAction }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name={icon} size={42} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && <Button onClick={onAction}>{action}</Button>}
    </div>
  );
}
