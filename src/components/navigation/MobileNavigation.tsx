import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui";
import { navigationItems, type NavigationItem } from "@/constants/navigation";
import { useUiStore } from "@/stores/use-ui-store";

export function MobileNavigation() {
  const navigate = useNavigate();
  const setPanel = useUiStore((state) => state.setPanel);
  const openCreatePost = useUiStore((state) => state.openCreatePost);

  function handleNavigation(item: NavigationItem) {
    if (item.route) {
      navigate(item.route);
      return;
    }

    if (item.action === "create") {
      openCreatePost();
      return;
    }

    setPanel(item.action ?? null);
  }

  return (
    <nav className="mobile-nav">
      {navigationItems.slice(0, 6).map((item) => (
        <button key={item.label} onClick={() => handleNavigation(item)} aria-label={item.label}>
          <Icon name={item.name} />
        </button>
      ))}
    </nav>
  );
}
