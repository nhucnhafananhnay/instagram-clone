import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon, Logo } from "@/components/ui";
import { navigationItems, type NavigationItem } from "@/constants/navigation";
import { useUiStore } from "@/stores/use-ui-store";
import { getUnreadCount } from "@/services/messages/message.api";

export function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const panel = useUiStore((state) => state.panel);
  const closeTransientUi = useUiStore((state) => state.closeTransientUi);
  const togglePanel = useUiStore((state) => state.togglePanel);
  const openCreatePost = useUiStore((state) => state.openCreatePost);
  const toggleMoreMenu = useUiStore((state) => state.toggleMoreMenu);
  const setMessagesOpen = useUiStore((state) => state.setMessagesOpen);
  const collapsed = panel !== null || pathname === "/chat";
  const unreadQuery = useQuery({
    queryKey: ["unread-count"],
    queryFn: getUnreadCount,
    retry: false,
  });

  function goTo(path: string) {
    closeTransientUi();
    setMessagesOpen(false);
    navigate(path);
    window.scrollTo(0, 0);
  }

  function handleNavigation(item: NavigationItem) {
    if (item.route) {
      goTo(item.route);
      return;
    }

    if (item.action === "search" || item.action === "notifications") {
      togglePanel(item.action);
    }

    if (item.action === "create") {
      openCreatePost();
    }
  }

  function goToHome() {
    goTo("/");
  }

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button className="side-logo" onClick={goToHome}>
        <Logo compact={collapsed} />
      </button>
      <nav>
        {navigationItems.map((item) => {
          const active =
            item.route === pathname ||
            item.action === panel ||
            (item.route === "/user/me" && pathname.startsWith("/user"));
          return (
            <button
              key={item.label}
              className={`nav-item ${active ? "active" : ""}`}
              onClick={() => handleNavigation(item)}
            >
              <Icon
                name={item.name}
                fill={active && (item.name === "home" || item.name === "heart")}
              />
              <span>
                {item.label}
                {item.name === "message" && !!unreadQuery.data && ` (${unreadQuery.data})`}
              </span>
            </button>
          );
        })}
      </nav>
      <button className="nav-item more-nav" onClick={toggleMoreMenu}>
        <Icon name="menu" />
        <span>Xem thêm</span>
      </button>
    </aside>
  );
}
