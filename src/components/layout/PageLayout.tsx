import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/shared/skip-link";
import { isDashboardPath } from "@/lib/nav-config";
import { cn } from "@/lib/utils";
import { FloatingChatPanel } from "@/components/ui/floating-chat-panel";
import { TopBar } from "@/components/layout/TopBar";

export function PageLayout() {
  const location = useLocation();
  const hasSidebar = isDashboardPath(location.pathname);
  const showFloatingChat = location.pathname !== "/tanya";

  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      <SkipLink />
      {!hasSidebar && <TopBar />}
      <Navbar withTopBar={!hasSidebar} />
      <div
        className={cn(
          "flex w-full flex-1",
          !hasSidebar && "mx-auto max-w-[var(--layout-max)]"
        )}
      >
        {hasSidebar && <Sidebar withTopBar={false} />}
        <main
          id="main-content"
          className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 sm:pb-12 sm:pt-8"
        >
          <Outlet />
        </main>
      </div>
      {!hasSidebar && <Footer />}
      {showFloatingChat && <FloatingChatPanel />}
    </div>
  );
}
